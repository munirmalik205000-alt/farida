from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import random
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'smartpay360_secret_key_change_in_production')
JWT_ALGORITHM = 'HS256'

def generate_referral_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        user = await db.users.find_one({'id': user_id}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail='User not found')
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')

class SignupRequest(BaseModel):
    referral_code: str
    full_name: str
    mobile: str
    password: str

class LoginRequest(BaseModel):
    mobile: str
    password: str

class UserResponse(BaseModel):
    id: str
    full_name: str
    mobile: str
    referral_code: str
    referred_by: Optional[str] = None
    level: int
    main_wallet: float
    e_wallet: float
    coins: int = 0
    is_activated: bool = False
    is_admin: bool
    created_at: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class TransactionCreate(BaseModel):
    type: str
    amount: float
    description: str
    to_user_id: Optional[str] = None

class TransactionResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    type: str
    amount: float
    from_wallet: Optional[str] = None
    to_wallet: Optional[str] = None
    status: str
    description: str
    created_at: str

class FundRequestCreate(BaseModel):
    amount: float
    payment_proof: Optional[str] = None

class FundRequestResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_mobile: str
    amount: float
    status: str
    payment_proof: Optional[str] = None
    created_at: str

class RechargeRequest(BaseModel):
    service_type: str
    number: str
    amount: float
    operator: Optional[str] = None
    use_coins: bool = False

class RechargeResponse(BaseModel):
    id: str
    service_type: str
    number: str
    amount: float
    status: str
    created_at: str

class ProductResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image: str
    stock: int

class OrderCreate(BaseModel):
    product_id: str
    quantity: int = 1

class OrderResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    quantity: int
    amount: float
    status: str
    created_at: str

class CommissionResponse(BaseModel):
    id: str
    from_user_name: str
    level: int
    amount: float
    type: str
    created_at: str

class PackageCreate(BaseModel):
    name: str
    price: float
    coins: int
    image: str
    description: Optional[str] = None

class PackageResponse(BaseModel):
    id: str
    name: str
    price: float
    coins: int
    image: str
    description: Optional[str] = None
    is_active: bool
    created_at: str

class SettingsResponse(BaseModel):
    coin_usage_percentage: float

class SettingsUpdate(BaseModel):
    coin_usage_percentage: float

class DashboardStats(BaseModel):
    total_income: float
    today_income: float
    repurchase_income: float
    main_wallet: float
    e_wallet: float
    total_users: int = 0
    pending_fund_requests: int = 0

class WalletTransferRequest(BaseModel):
    to_user_mobile: str
    amount: float

class WithdrawalRequest(BaseModel):
    amount: float
    method: str = 'bank'

@api_router.post('/auth/signup', response_model=AuthResponse)
async def signup(req: SignupRequest):
    existing = await db.users.find_one({'mobile': req.mobile})
    if existing:
        raise HTTPException(status_code=400, detail='Mobile number already registered')
    
    referrer = await db.users.find_one({'referral_code': req.referral_code}, {'_id': 0})
    if not referrer:
        raise HTTPException(status_code=400, detail='Invalid referral code')
    
    user_id = str(uuid.uuid4())
    user_doc = {
        'id': user_id,
        'full_name': req.full_name,
        'mobile': req.mobile,
        'password': hash_password(req.password),
        'referral_code': generate_referral_code(),
        'referred_by': referrer['id'],
        'level': referrer['level'] + 1,
        'main_wallet': 0.0,
        'e_wallet': 0.0,
        'coins': 0,
        'is_activated': False,
        'is_admin': False,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    user_doc.pop('password')
    
    token = create_token(user_id)
    return {'token': token, 'user': user_doc}

@api_router.post('/auth/login', response_model=AuthResponse)
async def login(req: LoginRequest):
    user = await db.users.find_one({'mobile': req.mobile}, {'_id': 0})
    if not user or not verify_password(req.password, user['password']):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    
    user_copy = user.copy()
    user_copy.pop('password')
    
    token = create_token(user['id'])
    return {'token': token, 'user': user_copy}

@api_router.get('/user/dashboard', response_model=DashboardStats)
async def get_user_dashboard(current_user: dict = Depends(get_current_user)):
    commissions = await db.mlm_commissions.find({'user_id': current_user['id']}, {'_id': 0}).to_list(None)
    
    total_income = sum(c['amount'] for c in commissions)
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_commissions = [c for c in commissions if datetime.fromisoformat(c['created_at']) >= today_start]
    today_income = sum(c['amount'] for c in today_commissions)
    
    repurchase_commissions = [c for c in commissions if c['type'] == 'repurchase']
    repurchase_income = sum(c['amount'] for c in repurchase_commissions)
    
    return {
        'total_income': total_income,
        'today_income': today_income,
        'repurchase_income': repurchase_income,
        'main_wallet': current_user['main_wallet'],
        'e_wallet': current_user['e_wallet']
    }

@api_router.post('/wallet/fund-request', response_model=FundRequestResponse)
async def create_fund_request(req: FundRequestCreate, current_user: dict = Depends(get_current_user)):
    request_id = str(uuid.uuid4())
    request_doc = {
        'id': request_id,
        'user_id': current_user['id'],
        'user_name': current_user['full_name'],
        'user_mobile': current_user['mobile'],
        'amount': req.amount,
        'status': 'pending',
        'payment_proof': req.payment_proof,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.fund_requests.insert_one(request_doc)
    return request_doc

@api_router.get('/wallet/fund-requests', response_model=List[FundRequestResponse])
async def get_user_fund_requests(current_user: dict = Depends(get_current_user)):
    requests = await db.fund_requests.find({'user_id': current_user['id']}, {'_id': 0}).to_list(None)
    return requests

@api_router.post('/wallet/withdrawal')
async def create_withdrawal(req: WithdrawalRequest, current_user: dict = Depends(get_current_user)):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail='Amount must be greater than 0')
    if current_user['main_wallet'] < req.amount:
        raise HTTPException(status_code=400, detail='Insufficient Main Wallet balance')
    
    withdrawal_doc = {
        'id': str(uuid.uuid4()),
        'user_id': current_user['id'],
        'user_name': current_user['full_name'],
        'user_mobile': current_user['mobile'],
        'amount': req.amount,
        'method': req.method,
        'status': 'pending',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.withdrawals.insert_one(withdrawal_doc)
    
    transaction_doc = {
        'id': str(uuid.uuid4()),
        'user_id': current_user['id'],
        'user_name': current_user['full_name'],
        'type': 'withdrawal',
        'amount': req.amount,
        'from_wallet': 'main_wallet',
        'to_wallet': None,
        'status': 'pending',
        'description': f'Withdrawal request via {req.method} - {req.amount}',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(transaction_doc)
    
    return {'message': 'Withdrawal request submitted successfully', 'withdrawal_id': withdrawal_doc['id']}

@api_router.post('/wallet/transfer')
async def transfer_wallet(req: WalletTransferRequest, current_user: dict = Depends(get_current_user)):
    if current_user['e_wallet'] < req.amount:
        raise HTTPException(status_code=400, detail='Insufficient E-Wallet balance')
    
    to_user = await db.users.find_one({'mobile': req.to_user_mobile}, {'_id': 0})
    if not to_user:
        raise HTTPException(status_code=404, detail='Recipient not found')
    
    await db.users.update_one(
        {'id': current_user['id']},
        {'$inc': {'e_wallet': -req.amount}}
    )
    
    await db.users.update_one(
        {'id': to_user['id']},
        {'$inc': {'e_wallet': req.amount}}
    )
    
    transaction_doc = {
        'id': str(uuid.uuid4()),
        'user_id': current_user['id'],
        'user_name': current_user['full_name'],
        'type': 'transfer',
        'amount': req.amount,
        'from_wallet': 'e_wallet',
        'to_wallet': 'e_wallet',
        'to_user_id': to_user['id'],
        'to_user_name': to_user['full_name'],
        'status': 'completed',
        'description': f'Transfer to {to_user["full_name"]} ({to_user["mobile"]})',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.transactions.insert_one(transaction_doc)
    
    return {'message': 'Transfer successful', 'transaction': transaction_doc}

@api_router.get('/transactions', response_model=List[TransactionResponse])
async def get_user_transactions(current_user: dict = Depends(get_current_user)):
    transactions = await db.transactions.find(
        {'user_id': current_user['id']}, 
        {'_id': 0}
    ).sort('created_at', -1).to_list(50)
    return transactions

@api_router.post('/recharge', response_model=RechargeResponse)
async def create_recharge(req: RechargeRequest, current_user: dict = Depends(get_current_user)):
    final_amount = req.amount
    coins_used = 0
    
    if req.use_coins and current_user.get('coins', 0) > 0:
        settings = await db.settings.find_one({}, {'_id': 0})
        coin_percentage = settings.get('coin_usage_percentage', 10.0) if settings else 10.0
        
        max_coin_value = req.amount * (coin_percentage / 100)
        coins_available = current_user['coins']
        coins_used = min(coins_available, int(max_coin_value))
        
        final_amount = req.amount - coins_used
        
        await db.users.update_one(
            {'id': current_user['id']},
            {'$inc': {'coins': -coins_used}}
        )
    
    if current_user['main_wallet'] < final_amount:
        raise HTTPException(status_code=400, detail='Insufficient Main Wallet balance')
    
    await db.users.update_one(
        {'id': current_user['id']},
        {'$inc': {'main_wallet': -final_amount}}
    )
    
    recharge_id = str(uuid.uuid4())
    recharge_doc = {
        'id': recharge_id,
        'user_id': current_user['id'],
        'service_type': req.service_type,
        'number': req.number,
        'amount': req.amount,
        'coins_used': coins_used,
        'final_amount': final_amount,
        'operator': req.operator,
        'status': 'success',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.recharge_history.insert_one(recharge_doc)
    
    description = f'{req.service_type} recharge for {req.number}'
    if coins_used > 0:
        description += f' (Used {coins_used} coins)'
    
    transaction_doc = {
        'id': str(uuid.uuid4()),
        'user_id': current_user['id'],
        'user_name': current_user['full_name'],
        'type': 'recharge',
        'amount': req.amount,
        'from_wallet': 'main_wallet',
        'to_wallet': None,
        'status': 'completed',
        'description': description,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.transactions.insert_one(transaction_doc)
    
    await distribute_mlm_commission(current_user['id'], req.amount, 'recharge')
    
    return recharge_doc

@api_router.get('/recharge/history', response_model=List[RechargeResponse])
async def get_recharge_history(current_user: dict = Depends(get_current_user)):
    history = await db.recharge_history.find(
        {'user_id': current_user['id']}, 
        {'_id': 0}
    ).sort('created_at', -1).to_list(50)
    return history

@api_router.get('/products', response_model=List[ProductResponse])
async def get_products():
    products = await db.products.find({}, {'_id': 0}).to_list(None)
    return products

@api_router.post('/orders', response_model=OrderResponse)
async def create_order(req: OrderCreate, current_user: dict = Depends(get_current_user)):
    product = await db.products.find_one({'id': req.product_id}, {'_id': 0})
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    
    if product['stock'] < req.quantity:
        raise HTTPException(status_code=400, detail='Insufficient stock')
    
    total_amount = product['price'] * req.quantity
    
    if current_user['e_wallet'] < total_amount:
        raise HTTPException(status_code=400, detail='Insufficient E-Wallet balance')
    
    await db.users.update_one(
        {'id': current_user['id']},
        {'$inc': {'e_wallet': -total_amount}}
    )
    
    await db.products.update_one(
        {'id': req.product_id},
        {'$inc': {'stock': -req.quantity}}
    )
    
    order_id = str(uuid.uuid4())
    order_doc = {
        'id': order_id,
        'user_id': current_user['id'],
        'product_id': req.product_id,
        'product_name': product['name'],
        'quantity': req.quantity,
        'amount': total_amount,
        'status': 'completed',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    await distribute_mlm_commission(current_user['id'], total_amount, 'repurchase')
    
    return order_doc

@api_router.get('/orders', response_model=List[OrderResponse])
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    orders = await db.orders.find(
        {'user_id': current_user['id']}, 
        {'_id': 0}
    ).sort('created_at', -1).to_list(50)
    return orders

@api_router.get('/mlm/downline', response_model=List[UserResponse])
async def get_downline_users(current_user: dict = Depends(get_current_user)):
    downline = await db.users.find(
        {'referred_by': current_user['id']}, 
        {'_id': 0, 'password': 0}
    ).to_list(None)
    return downline

@api_router.get('/mlm/commissions', response_model=List[CommissionResponse])
async def get_user_commissions(current_user: dict = Depends(get_current_user)):
    commissions = await db.mlm_commissions.find(
        {'user_id': current_user['id']}, 
        {'_id': 0}
    ).sort('created_at', -1).to_list(100)
    return commissions

async def distribute_mlm_commission(user_id: str, amount: float, commission_type: str):
    commission_rates = [0.10, 0.08, 0.06, 0.05, 0.04, 0.03, 0.03, 0.02, 0.02, 0.02,
                        0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
    
    current_user = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not current_user or not current_user.get('referred_by'):
        return
    
    current_referrer_id = current_user['referred_by']
    level = 1
    
    while current_referrer_id and level <= 20:
        referrer = await db.users.find_one({'id': current_referrer_id}, {'_id': 0})
        if not referrer:
            break
        
        commission_amount = amount * commission_rates[level - 1]
        
        await db.users.update_one(
            {'id': referrer['id']},
            {'$inc': {'e_wallet': commission_amount}}
        )
        
        commission_doc = {
            'id': str(uuid.uuid4()),
            'user_id': referrer['id'],
            'from_user_id': user_id,
            'from_user_name': current_user['full_name'],
            'level': level,
            'amount': commission_amount,
            'type': commission_type,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        await db.mlm_commissions.insert_one(commission_doc)
        
        current_referrer_id = referrer.get('referred_by')
        level += 1

@api_router.get('/admin/dashboard', response_model=DashboardStats)
async def get_admin_dashboard(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    
    total_users = await db.users.count_documents({})
    
    users = await db.users.find({}, {'_id': 0, 'main_wallet': 1, 'e_wallet': 1}).to_list(None)
    total_main_wallet = sum(u['main_wallet'] for u in users)
    total_e_wallet = sum(u['e_wallet'] for u in users)
    
    pending_requests = await db.fund_requests.count_documents({'status': 'pending'})
    
    return {
        'total_income': 0,
        'today_income': 0,
        'repurchase_income': 0,
        'main_wallet': total_main_wallet,
        'e_wallet': total_e_wallet,
        'total_users': total_users,
        'pending_fund_requests': pending_requests
    }

@api_router.get('/admin/users', response_model=List[UserResponse])
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    
    users = await db.users.find({}, {'_id': 0, 'password': 0}).to_list(None)
    return users

@api_router.get('/admin/fund-requests', response_model=List[FundRequestResponse])
async def get_all_fund_requests(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    
    requests = await db.fund_requests.find({}, {'_id': 0}).sort('created_at', -1).to_list(None)
    return requests

@api_router.post('/admin/fund-requests/{request_id}/approve')
async def approve_fund_request(request_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    
    request = await db.fund_requests.find_one({'id': request_id}, {'_id': 0})
    if not request:
        raise HTTPException(status_code=404, detail='Request not found')
    
    if request['status'] != 'pending':
        raise HTTPException(status_code=400, detail='Request already processed')
    
    await db.fund_requests.update_one(
        {'id': request_id},
        {'$set': {'status': 'approved'}}
    )
    
    await db.users.update_one(
        {'id': request['user_id']},
        {'$inc': {'main_wallet': request['amount']}}
    )
    
    transaction_doc = {
        'id': str(uuid.uuid4()),
        'user_id': request['user_id'],
        'user_name': request['user_name'],
        'type': 'fund_add',
        'amount': request['amount'],
        'from_wallet': None,
        'to_wallet': 'main_wallet',
        'status': 'completed',
        'description': 'Fund request approved',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.transactions.insert_one(transaction_doc)
    
    return {'message': 'Fund request approved'}

@api_router.post('/admin/fund-requests/{request_id}/reject')
async def reject_fund_request(request_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    
    request = await db.fund_requests.find_one({'id': request_id}, {'_id': 0})
    if not request:
        raise HTTPException(status_code=404, detail='Request not found')
    
    if request['status'] != 'pending':
        raise HTTPException(status_code=400, detail='Request already processed')
    
    await db.fund_requests.update_one(
        {'id': request_id},
        {'$set': {'status': 'rejected'}}
    )
    
    return {'message': 'Fund request rejected'}

@api_router.get('/admin/transactions', response_model=List[TransactionResponse])
async def get_all_transactions(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    
    transactions = await db.transactions.find({}, {'_id': 0}).sort('created_at', -1).to_list(100)
    return transactions

# Package Management
@api_router.post('/admin/packages', response_model=PackageResponse)
async def create_package(req: PackageCreate, current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    
    package_id = str(uuid.uuid4())
    package_doc = {
        'id': package_id,
        'name': req.name,
        'price': req.price,
        'coins': req.coins,
        'image': req.image,
        'description': req.description,
        'is_active': True,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.packages.insert_one(package_doc)
    return package_doc

@api_router.get('/packages', response_model=List[PackageResponse])
async def get_packages():
    packages = await db.packages.find({'is_active': True}, {'_id': 0}).to_list(None)
    return packages

@api_router.post('/packages/{package_id}/purchase')
async def purchase_package(package_id: str, current_user: dict = Depends(get_current_user)):
    package = await db.packages.find_one({'id': package_id, 'is_active': True}, {'_id': 0})
    if not package:
        raise HTTPException(status_code=404, detail='Package not found')
    
    if current_user['main_wallet'] < package['price']:
        raise HTTPException(status_code=400, detail='Insufficient wallet balance')
    
    await db.users.update_one(
        {'id': current_user['id']},
        {
            '$inc': {
                'main_wallet': -package['price'],
                'coins': package['coins']
            },
            '$set': {'is_activated': True}
        }
    )
    
    transaction_doc = {
        'id': str(uuid.uuid4()),
        'user_id': current_user['id'],
        'user_name': current_user['full_name'],
        'type': 'package_purchase',
        'amount': package['price'],
        'from_wallet': 'main_wallet',
        'to_wallet': None,
        'status': 'completed',
        'description': f'Purchased {package["name"]} package',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.transactions.insert_one(transaction_doc)
    
    return {'message': 'Package purchased successfully', 'coins_awarded': package['coins']}

# Settings Management
@api_router.get('/admin/settings', response_model=SettingsResponse)
async def get_settings(current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    
    settings = await db.settings.find_one({}, {'_id': 0})
    if not settings:
        settings = {'coin_usage_percentage': 10.0}
        await db.settings.insert_one(settings)
    
    return settings

@api_router.post('/admin/settings')
async def update_settings(req: SettingsUpdate, current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail='Admin access required')
    
    await db.settings.update_one(
        {},
        {'$set': {'coin_usage_percentage': req.coin_usage_percentage}},
        upsert=True
    )
    
    return {'message': 'Settings updated successfully'}

@api_router.post('/admin/seed-data')
async def seed_data():
    admin_exists = await db.users.find_one({'is_admin': True})
    if admin_exists:
        return {'message': 'Admin already exists'}
    
    admin_id = str(uuid.uuid4())
    admin_doc = {
        'id': admin_id,
        'full_name': 'Admin',
        'mobile': '9999999999',
        'password': hash_password('admin123'),
        'referral_code': 'ADMIN001',
        'referred_by': None,
        'level': 0,
        'main_wallet': 10000.0,
        'e_wallet': 5000.0,
        'coins': 1000,
        'is_activated': True,
        'is_admin': True,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_doc)
    
    products = [
        {
            'id': str(uuid.uuid4()),
            'name': 'Premium Mobile Package',
            'description': 'Unlock premium mobile features',
            'price': 999.0,
            'image': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
            'stock': 100
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Digital Voucher ₹500',
            'description': 'Use for any recharge or payment',
            'price': 500.0,
            'image': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3',
            'stock': 50
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Annual Membership',
            'description': 'Get exclusive benefits for 1 year',
            'price': 2499.0,
            'image': 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62',
            'stock': 25
        }
    ]
    
    await db.products.insert_many(products)
    
    return {'message': 'Seed data created successfully', 'admin_mobile': '9999999999', 'admin_password': 'admin123', 'admin_referral_code': 'ADMIN001'}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=['*'],
    allow_headers=['*'],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event('shutdown')
async def shutdown_db_client():
    client.close()

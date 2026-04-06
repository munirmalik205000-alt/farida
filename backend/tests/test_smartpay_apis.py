"""
Smartpay360 Backend API Tests
Tests for: Auth, Wallet, Withdrawal, Transactions, Packages, MLM, E-commerce
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_MOBILE = "9999999999"
ADMIN_PASSWORD = "admin123"
TEST_USER_MOBILE = "8888888888"
TEST_USER_PASSWORD = "test123"


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "mobile": ADMIN_MOBILE,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["is_admin"] == True
        print(f"✓ Admin login successful")
    
    def test_user_login_success(self):
        """Test user login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "mobile": TEST_USER_MOBILE,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200, f"User login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["is_admin"] == False
        print(f"✓ User login successful, main_wallet={data['user']['main_wallet']}, e_wallet={data['user']['e_wallet']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "mobile": "0000000000",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print(f"✓ Invalid credentials rejected correctly")


class TestWalletEndpoints:
    """Wallet operations tests"""
    
    @pytest.fixture
    def user_token(self):
        """Get user auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "mobile": TEST_USER_MOBILE,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("User login failed")
    
    def test_user_dashboard(self, user_token):
        """Test user dashboard endpoint"""
        response = requests.get(f"{BASE_URL}/api/user/dashboard", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        assert "main_wallet" in data
        assert "e_wallet" in data
        assert "total_income" in data
        print(f"✓ Dashboard loaded: main_wallet={data['main_wallet']}, e_wallet={data['e_wallet']}")
    
    def test_fund_request_create(self, user_token):
        """Test fund request creation"""
        response = requests.post(f"{BASE_URL}/api/wallet/fund-request", 
            json={"amount": 100.0},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200, f"Fund request failed: {response.text}"
        data = response.json()
        assert data["status"] == "pending"
        assert data["amount"] == 100.0
        print(f"✓ Fund request created: id={data['id']}")
    
    def test_fund_requests_list(self, user_token):
        """Test fund requests listing"""
        response = requests.get(f"{BASE_URL}/api/wallet/fund-requests", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200, f"Fund requests list failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Fund requests listed: {len(data)} requests")


class TestWithdrawalEndpoint:
    """NEW: Withdrawal endpoint tests - POST /api/wallet/withdrawal"""
    
    @pytest.fixture
    def user_token(self):
        """Get user auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "mobile": TEST_USER_MOBILE,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("User login failed")
    
    def test_withdrawal_success(self, user_token):
        """Test withdrawal request with valid amount"""
        response = requests.post(f"{BASE_URL}/api/wallet/withdrawal",
            json={"amount": 10.0, "method": "bank"},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200, f"Withdrawal failed: {response.text}"
        data = response.json()
        assert "message" in data
        assert "withdrawal_id" in data
        print(f"✓ Withdrawal request created: {data['withdrawal_id']}")
    
    def test_withdrawal_upi_method(self, user_token):
        """Test withdrawal with UPI method"""
        response = requests.post(f"{BASE_URL}/api/wallet/withdrawal",
            json={"amount": 5.0, "method": "upi"},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200, f"UPI withdrawal failed: {response.text}"
        data = response.json()
        assert "withdrawal_id" in data
        print(f"✓ UPI withdrawal request created")
    
    def test_withdrawal_paytm_method(self, user_token):
        """Test withdrawal with Paytm method"""
        response = requests.post(f"{BASE_URL}/api/wallet/withdrawal",
            json={"amount": 5.0, "method": "paytm"},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200, f"Paytm withdrawal failed: {response.text}"
        print(f"✓ Paytm withdrawal request created")
    
    def test_withdrawal_insufficient_balance(self, user_token):
        """Test withdrawal with insufficient balance"""
        response = requests.post(f"{BASE_URL}/api/wallet/withdrawal",
            json={"amount": 99999.0, "method": "bank"},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 400, f"Should fail with insufficient balance"
        print(f"✓ Insufficient balance correctly rejected")
    
    def test_withdrawal_zero_amount(self, user_token):
        """Test withdrawal with zero amount"""
        response = requests.post(f"{BASE_URL}/api/wallet/withdrawal",
            json={"amount": 0, "method": "bank"},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 400, f"Should fail with zero amount"
        print(f"✓ Zero amount correctly rejected")


class TestTransactionsEndpoint:
    """Transaction history tests"""
    
    @pytest.fixture
    def user_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "mobile": TEST_USER_MOBILE,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("User login failed")
    
    def test_transactions_list(self, user_token):
        """Test transactions listing"""
        response = requests.get(f"{BASE_URL}/api/transactions", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200, f"Transactions failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Transactions listed: {len(data)} transactions")


class TestMLMEndpoints:
    """MLM/Downline tests"""
    
    @pytest.fixture
    def user_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "mobile": TEST_USER_MOBILE,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("User login failed")
    
    def test_downline_list(self, user_token):
        """Test downline users listing"""
        response = requests.get(f"{BASE_URL}/api/mlm/downline", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200, f"Downline failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Downline listed: {len(data)} users")
    
    def test_commissions_list(self, user_token):
        """Test commissions listing"""
        response = requests.get(f"{BASE_URL}/api/mlm/commissions", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200, f"Commissions failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Commissions listed: {len(data)} commissions")


class TestPackagesEndpoint:
    """Packages tests"""
    
    def test_packages_list(self):
        """Test packages listing (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/packages")
        assert response.status_code == 200, f"Packages failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Packages listed: {len(data)} packages")


class TestProductsEndpoint:
    """E-commerce products tests"""
    
    def test_products_list(self):
        """Test products listing (public endpoint)"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200, f"Products failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Products listed: {len(data)} products")


class TestOrdersEndpoint:
    """Orders tests"""
    
    @pytest.fixture
    def user_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "mobile": TEST_USER_MOBILE,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("User login failed")
    
    def test_orders_list(self, user_token):
        """Test orders listing"""
        response = requests.get(f"{BASE_URL}/api/orders", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200, f"Orders failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Orders listed: {len(data)} orders")


class TestRechargeEndpoint:
    """Recharge tests"""
    
    @pytest.fixture
    def user_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "mobile": TEST_USER_MOBILE,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("User login failed")
    
    def test_recharge_history(self, user_token):
        """Test recharge history listing"""
        response = requests.get(f"{BASE_URL}/api/recharge/history", headers={
            "Authorization": f"Bearer {user_token}"
        })
        assert response.status_code == 200, f"Recharge history failed: {response.text}"
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Recharge history listed: {len(data)} recharges")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

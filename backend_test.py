#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class SmartpayAPITester:
    def __init__(self, base_url="https://payrecharge-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test credentials from /app/memory/test_credentials.md
        self.admin_mobile = "9999999999"
        self.admin_password = "admin123"
        self.admin_referral_code = "ADMIN001"

    def log_result(self, test_name, success, response_data=None, error_msg=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
            if response_data:
                print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
        else:
            self.failed_tests.append({
                'test': test_name,
                'error': error_msg,
                'response': response_data
            })
            print(f"❌ {test_name} - FAILED")
            if error_msg:
                print(f"   Error: {error_msg}")
            if response_data:
                print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")

    def make_request(self, method, endpoint, data=None, token=None, expected_status=200):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = {'text': response.text, 'status_code': response.status_code}

            return success, response_data, response.status_code

        except Exception as e:
            return False, {'error': str(e)}, 0

    def test_seed_data(self):
        """Test seeding initial data"""
        print("\n🌱 Testing seed data creation...")
        success, response_data, status_code = self.make_request('POST', 'admin/seed-data', expected_status=200)
        
        if success or status_code == 200:
            self.log_result("Seed Data Creation", True, response_data)
            return True
        else:
            self.log_result("Seed Data Creation", False, response_data, f"Status: {status_code}")
            return False

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔐 Testing admin login...")
        login_data = {
            "mobile": self.admin_mobile,
            "password": self.admin_password
        }
        
        success, response_data, status_code = self.make_request('POST', 'auth/login', login_data)
        
        if success and 'token' in response_data:
            self.admin_token = response_data['token']
            self.log_result("Admin Login", True, {'user': response_data.get('user', {})})
            return True
        else:
            self.log_result("Admin Login", False, response_data, f"Status: {status_code}")
            return False

    def test_user_signup(self):
        """Test user signup with admin referral code"""
        print("\n👤 Testing user signup...")
        timestamp = datetime.now().strftime("%H%M%S")
        signup_data = {
            "referral_code": self.admin_referral_code,
            "full_name": f"Test User {timestamp}",
            "mobile": f"9876543{timestamp[-3:]}",
            "password": "testpass123"
        }
        
        success, response_data, status_code = self.make_request('POST', 'auth/signup', signup_data)
        
        if success and 'token' in response_data:
            self.user_token = response_data['token']
            self.test_user_id = response_data['user']['id']
            self.test_user_mobile = signup_data['mobile']
            self.log_result("User Signup", True, {'user': response_data.get('user', {})})
            return True
        else:
            self.log_result("User Signup", False, response_data, f"Status: {status_code}")
            return False

    def test_user_dashboard(self):
        """Test user dashboard data"""
        print("\n📊 Testing user dashboard...")
        success, response_data, status_code = self.make_request('GET', 'user/dashboard', token=self.user_token)
        
        if success:
            required_fields = ['total_income', 'today_income', 'repurchase_income', 'main_wallet', 'e_wallet']
            missing_fields = [field for field in required_fields if field not in response_data]
            
            if not missing_fields:
                self.log_result("User Dashboard", True, response_data)
                return True
            else:
                self.log_result("User Dashboard", False, response_data, f"Missing fields: {missing_fields}")
                return False
        else:
            self.log_result("User Dashboard", False, response_data, f"Status: {status_code}")
            return False

    def test_fund_request(self):
        """Test fund request creation"""
        print("\n💰 Testing fund request...")
        fund_data = {"amount": 1000.0}
        
        success, response_data, status_code = self.make_request('POST', 'wallet/fund-request', fund_data, token=self.user_token)
        
        if success:
            self.fund_request_id = response_data.get('id')
            self.log_result("Fund Request Creation", True, response_data)
            return True
        else:
            self.log_result("Fund Request Creation", False, response_data, f"Status: {status_code}")
            return False

    def test_admin_dashboard(self):
        """Test admin dashboard"""
        print("\n🛡️ Testing admin dashboard...")
        success, response_data, status_code = self.make_request('GET', 'admin/dashboard', token=self.admin_token)
        
        if success:
            required_fields = ['total_users', 'main_wallet', 'e_wallet', 'pending_fund_requests']
            missing_fields = [field for field in required_fields if field not in response_data]
            
            if not missing_fields:
                self.log_result("Admin Dashboard", True, response_data)
                return True
            else:
                self.log_result("Admin Dashboard", False, response_data, f"Missing fields: {missing_fields}")
                return False
        else:
            self.log_result("Admin Dashboard", False, response_data, f"Status: {status_code}")
            return False

    def test_admin_fund_requests(self):
        """Test admin fund requests listing"""
        print("\n📋 Testing admin fund requests...")
        success, response_data, status_code = self.make_request('GET', 'admin/fund-requests', token=self.admin_token)
        
        if success and isinstance(response_data, list):
            self.log_result("Admin Fund Requests List", True, {'count': len(response_data)})
            return True
        else:
            self.log_result("Admin Fund Requests List", False, response_data, f"Status: {status_code}")
            return False

    def test_approve_fund_request(self):
        """Test fund request approval"""
        if not hasattr(self, 'fund_request_id'):
            print("⚠️ Skipping fund request approval - no request ID available")
            return False
            
        print("\n✅ Testing fund request approval...")
        success, response_data, status_code = self.make_request(
            'POST', f'admin/fund-requests/{self.fund_request_id}/approve', 
            token=self.admin_token
        )
        
        if success:
            self.log_result("Fund Request Approval", True, response_data)
            return True
        else:
            self.log_result("Fund Request Approval", False, response_data, f"Status: {status_code}")
            return False

    def test_wallet_transfer(self):
        """Test wallet transfer between users"""
        print("\n💸 Testing wallet transfer...")
        transfer_data = {
            "to_user_mobile": self.admin_mobile,
            "amount": 50.0
        }
        
        success, response_data, status_code = self.make_request('POST', 'wallet/transfer', transfer_data, token=self.user_token)
        
        if success:
            self.log_result("Wallet Transfer", True, response_data)
            return True
        else:
            self.log_result("Wallet Transfer", False, response_data, f"Status: {status_code}")
            return False

    def test_recharge_service(self):
        """Test recharge service"""
        print("\n📱 Testing recharge service...")
        recharge_data = {
            "service_type": "mobile",
            "number": "9876543210",
            "amount": 100.0,
            "operator": "Airtel"
        }
        
        success, response_data, status_code = self.make_request('POST', 'recharge', recharge_data, token=self.user_token)
        
        if success:
            self.log_result("Mobile Recharge", True, response_data)
            return True
        else:
            self.log_result("Mobile Recharge", False, response_data, f"Status: {status_code}")
            return False

    def test_products_listing(self):
        """Test products listing"""
        print("\n🛍️ Testing products listing...")
        success, response_data, status_code = self.make_request('GET', 'products')
        
        if success and isinstance(response_data, list):
            self.log_result("Products Listing", True, {'count': len(response_data)})
            if response_data:
                self.test_product_id = response_data[0]['id']
                return True
            return True
        else:
            self.log_result("Products Listing", False, response_data, f"Status: {status_code}")
            return False

    def test_product_purchase(self):
        """Test product purchase"""
        if not hasattr(self, 'test_product_id'):
            print("⚠️ Skipping product purchase - no product ID available")
            return False
            
        print("\n🛒 Testing product purchase...")
        order_data = {
            "product_id": self.test_product_id,
            "quantity": 1
        }
        
        success, response_data, status_code = self.make_request('POST', 'orders', order_data, token=self.user_token)
        
        if success:
            self.log_result("Product Purchase", True, response_data)
            return True
        else:
            self.log_result("Product Purchase", False, response_data, f"Status: {status_code}")
            return False

    def test_mlm_downline(self):
        """Test MLM downline listing"""
        print("\n👥 Testing MLM downline...")
        success, response_data, status_code = self.make_request('GET', 'mlm/downline', token=self.admin_token)
        
        if success and isinstance(response_data, list):
            self.log_result("MLM Downline", True, {'count': len(response_data)})
            return True
        else:
            self.log_result("MLM Downline", False, response_data, f"Status: {status_code}")
            return False

    def test_mlm_commissions(self):
        """Test MLM commissions"""
        print("\n💎 Testing MLM commissions...")
        success, response_data, status_code = self.make_request('GET', 'mlm/commissions', token=self.admin_token)
        
        if success and isinstance(response_data, list):
            self.log_result("MLM Commissions", True, {'count': len(response_data)})
            return True
        else:
            self.log_result("MLM Commissions", False, response_data, f"Status: {status_code}")
            return False

    def test_transactions_history(self):
        """Test transactions history"""
        print("\n📈 Testing transactions history...")
        success, response_data, status_code = self.make_request('GET', 'transactions', token=self.user_token)
        
        if success and isinstance(response_data, list):
            self.log_result("Transactions History", True, {'count': len(response_data)})
            return True
        else:
            self.log_result("Transactions History", False, response_data, f"Status: {status_code}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Smartpay360 Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)

        # Test sequence
        test_sequence = [
            self.test_seed_data,
            self.test_admin_login,
            self.test_user_signup,
            self.test_user_dashboard,
            self.test_fund_request,
            self.test_admin_dashboard,
            self.test_admin_fund_requests,
            self.test_approve_fund_request,
            self.test_wallet_transfer,
            self.test_recharge_service,
            self.test_products_listing,
            self.test_product_purchase,
            self.test_mlm_downline,
            self.test_mlm_commissions,
            self.test_transactions_history
        ]

        for test_func in test_sequence:
            try:
                test_func()
            except Exception as e:
                self.log_result(test_func.__name__, False, None, str(e))

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Failed: {len(self.failed_tests)}/{self.tests_run}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for failed in self.failed_tests:
                print(f"   • {failed['test']}: {failed['error']}")

        return self.tests_passed == self.tests_run

def main():
    tester = SmartpayAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
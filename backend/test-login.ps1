
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{}"
echo ""
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"username\": \"test\", \"password\": \"test\"}"
echo ""

#### TPS/RPS 측정을 위한 대용량 테스트 Artillery 스크립트 모음

### **generate-reservation-payload.ts**

TPS/RPS 테스트용으로 userId, seatId, eventId가 포함된 예약 요청을 Artillery가 읽을 수 있도록
JSON 형태의 payload(reservation-test-payload.json)를 자동으로 생성하는 스크립트

1. cd ticketing-backend/artillery
2. npx ts-node generate-reservation-payload.ts
3. jq -r '.[] | "\(.userId),\(.seatId),\(.eventId)"' reservation-test-payload.json > reservation-test-payload.csv\n

```
[
  {
    "userId": 1,
    "seatId": "uuid-xxxx-xxx",
    "eventId": "uuid-yyyy-yyy"
  },
  ...
]
```

이 데이터를 기반으로 Artillery가 reservation API를 대량 호출하여 서버 부하 테스트를 진행

### **reservation-test.yml**

1. artillery run reservation-test.yml --output artillery-result.json

## 작업기록

- npm install @nestjs/typeorm typeorm mysql2 --legacy-peer-deps
- npm install @nestjs/passport passport passport-jwt --legacy-peer-deps
- npm install @nestjs/jwt --legacy-peer-deps
- npm install bcrypt --legacy-peer-deps
- npm install --save-dev @types/bcrypt
- npm install class-validator class-transformer --legacy-peer-deps

## 에러기록

- 1. npm 설치 도중 버젼 충돌 (typeorm@0.3.25 과 redis@5.6.0의 충돌)
     --legacy-peer-deps는 npm v7 이후 도입된 peer dependency 충돌 감지를 무시하고 설치하는 옵션입니다.
     redis@5.x, typeorm, passport, @nestjs/\*는 모두 공식적으로 호환되지 않는 것은 아니며,
     단지 npm이 엄격하게 peerDependency 버전을 감지하는 것일 뿐입니다.

- 2. Unsafe assignment of an error typed value.

```
passwordHash = await bcrypt.hash(password, 10);
```

bcrypt.hash()는 내부적으로 function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string> (+1 overload)

```
'@typescript-eslint/no-unsafe-member-access': 'off',
'@typescript-eslint/no-unsafe-call': 'off',
'@typescript-eslint/no-unsafe-assignment': 'off',
```

- 위의 세개를 eslint.config.mjs에 추가하여 에러를 스킵함
- ExtractJwt가 any로 추론되어 접근하려할때 unsafe하다고 경고가 난 부분이라 @typescript-eslint/no-unsafe-member-access를 off하여 any, unknown, error 으로 추론되더라도 접근 가능하도록 변경
- 동일하게 call은 호출, assignment는 할당
- 하지만 전부 off하는 경우 타입안정성이 저하되고 디버깅이 어려워질수 있음. 그래서 access만 warn으로 바꾸고 필요에 따라 // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access 를 추가하는 방식으로 해결

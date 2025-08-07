import { OnModuleInit } from '@nestjs/common';
export declare class RedisService implements OnModuleInit {
    private client;
    onModuleInit(): Promise<void>;
    /**
     * 특정 키에 저장된 값을 조회
     * @param key Redis 키
     * @returns 저장된 문자열 값 또는 null
     * @성능 O(1) (메모리 조회)
     */
    get(key: string): Promise<string | null>;
    /**
     * 특정 키에 값을 저장 (선택적으로 TTL 적용)
     * @param key Redis 키
     * @param value 저장할 문자열 값
     * @param ttlInSeconds TTL(초 단위, 선택)
     * @returns 성공 시 "OK"
     * @성능 O(1)
     * @주의 원자성을 위해 SET 명령어에서 EX 옵션 사용
     */
    set(key: string, value: string, ttlInSeconds?: number): Promise<void>;
    /**
     * 특정 키 삭제
     * @param key Redis 키
     * @returns 삭제된 키 개수
     * @성능 O(1)
     */
    del(key: string): Promise<number>;
    /**
     * 특정 채널에 메시지 발행 (Pub/Sub)
     * @param channel 채널 이름
     * @param message 발행할 메시지
     * @returns 해당 메시지를 받은 클라이언트 수
     * @성능 O(N) (구독자 수에 비례)
     */
    publish(channel: string, message: string): Promise<void>;
    /**
     * 특정 채널을 구독하여 메시지 수신
     * @param channel 채널 이름
     * @param callback 메시지 수신 시 실행할 콜백
     * @성능 O(1)
     * @주의 duplicate() 사용으로 별도 연결 생성 → 사용 종료 시 unsubscribe 필요
     */
    subscribe(channel: string, callback: (message: string) => void): Promise<void>;
    /**
     * Set에 포함된 모든 멤버 조회
     * @param key Set 키
     * @returns 멤버 배열
     * @성능 O(N) (Set 크기에 비례)
     * @주의 매우 큰 Set은 SSCAN 사용 고려
     */
    smembers(key: string): Promise<string[]>;
    /**
     * Set에 멤버 추가
     * @param key Set 키
     * @param member 추가할 값
     * @returns 1: 추가 성공, 0: 이미 존재
     * @성능 O(1)
     */
    sadd(key: string, member: string): Promise<number>;
    /**
     * Set에서 특정 멤버 제거
     * @param key Set 키
     * @param member 제거할 값
     * @returns 제거된 개수
     * @성능 O(1)
     */
    srem(key: string, member: string): Promise<number>;
    /**
     * ZSET에 멤버 추가
     * @param key ZSET 키
     * @param score 정렬 기준 점수 (보통 timestamp 사용)
     * @param member 추가할 멤버
     * @returns 추가된 요소 개수 (이미 있으면 0)
     * @성능 O(logN)
     */
    zadd(key: string, score: number, member: string): Promise<number>;
    /**
     * ZSET에서 특정 멤버의 순위 조회
     * @param key ZSET 키
     * @param member 멤버 값
     * @returns 0부터 시작하는 순위 또는 null
     * @성능 O(logN)
     */
    zrank(key: string, member: string): Promise<number | null>;
    /**
     * ZSET에서 가장 낮은 score의 멤버 하나 추출 및 제거
     * @param key ZSET 키
     * @returns [멤버 값] 배열, 없으면 빈 배열
     * @성능 O(logN)
     */
    zpopmin(key: string): Promise<string[]>;
    /**
     * ZSET에서 특정 멤버 제거
     * @param key ZSET 키
     * @param member 제거할 멤버
     * @returns 제거된 요소 개수
     * @성능 O(logN)
     */
    zrem(key: string, member: string): Promise<number>;
    /**
     * ZSET에 포함된 멤버 개수 조회
     * @param key ZSET 키
     * @returns 멤버 개수
     * @성능 O(1)
     */
    zcard(key: string): Promise<number>;
    zrangeByScore(key: string, min: number, max: number): Promise<string[]>;
}
//# sourceMappingURL=redis.service.d.ts.map
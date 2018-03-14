# bitest_server

~~실시간~~ 파일 입력으로 들어오는 매수, 매도에 대해서 호가창을 보여주는 어플리케이션

## Requirement

- 입력은 1초에 1건씩, 순서대로 (파일 입력)
- 가격은 정수, 가격은 100 ~ 999까지 (1원 단위)
- 체결가 : 거래 (매수, 매도)가 성사된 가격
  - 매수가 = 매도가 인 경우 체결
  - 매수가가 매도가 보다 높은 경우 가장 낮은 매도가부터 수량만큼 체결
  - 매도가가 매수가 보다 낮은 경우 가장 높은 매수가부터 수량만큼 체결
- 현재가 : 마지막 체결가

## Problem

매수 시 매수가보다 매도가가 낮은 경우, 더 낮은 매도가에 구매 가능.
매수량이 변화할 가능성이 있음. (매수가, 매수량 모두 고정되지 않음)

매도 시 매도가보다 매수가가 높은 경우, 더 높은 매수가에 판매 가능.
하지만 매수량은 변하지 않음. (매수가만 고정되지 않음)

## Configuration

- Node + Express
- [Front Repository](https://github.com/jicjjang/bitest_front)
- Server Logic = ~~LongPolling~~, ~~Rest~~, **Websocket**
  - LongPolling
    - 서버와 클라이언트의 통신 이후에 특정 시간을 정해놓고 시간내에 다시 request가 발생하면 reconnection 없이 다시 데이터 교환이 가능.
    - 사람이 몰리면 오히려 reconnection 에서 병목이 생길 수 있음.
  - Rest
    - 가능하지만 유저가 많아지는 상황을 고려한다면 LongPolling과 마찬가지로 x. connection이 기하급수적으로 증가할 수 있음
  - WebSocket
    - http와는 다르게 websocket은 websocket의 프로토콜로 따로 돌아간다. 클라이언트에서 disconnection 제어가 가능하며 소켓으로 자유로운 통신이 가능하다.

## Usage

~~~shell
# install dependencies
$ npm i

# serve at localhost:3000
$ npm run dev
~~~

## Build, Production

~~~shell
# build for production with minification
$ npm run build

or

$ npm run start     #include build
~~~

## Test case & Resolve strategy

### test usage

~~~shell
# run all tests
$ npm run test
~~~

### 1. 나올 수 있는 경우의 수

- 세부 분류로 들어가면 더 많아짐

```
BUY
  매수가 == 최저 매도가
    1. 매수가 * 매수량 == 매도가 * 매도량
    2. 매수가 * 매수량 > 매도가 * 매도량
    3. 매수가 * 매수량 < 매도가 * 매도량
  매수가 > 최저 매도가
    4. 매수가 * 매수량 == 매도가 * 매도량
    5. 매수가 * 매수량 > 매도가 * 매도량
    6. 매수가 * 매수량 < 매도가 * 매도량
  매수가 < 최저 매도가
    7. 매수가 * 매수량 == 매도가 * 매도량
    8. 매수가 * 매수량 > 매도가 * 매도량
    9. 매수가 * 매수량 < 매도가 * 매도량
SELL
  최고 매수가 == 매도가
    10. 매수량 == 매도량
    11. 매수량 > 매도량
    12. 매수량 < 매도량
  최고 매수가 > 매도가
    13. 매수량 == 매도량
    14. 매수량 > 매도량
    15. 매수량 < 매도량
  최고 매수가 < 매도가
    16. 매수량 == 매도량
    17. 매수량 > 매도량
    18. 매수량 < 매도량
```

### 2. 테스트 케이스

- case 1. 임의의 초기 데이터를 주고 테스트 거래 데이터 (위의 경우에 수에 맞게 넣음)를 넣음
- case 2. 초기 데이터를 빈 값으로 주고 테스트 거래 데이터를 넣음 (비어있는 경우는 조금 다르나 이 경우도 같이 테스트)
- case 3. 임의의 초기 데이터를 주고 개발시 사용했던 거래 데이터를 넣음
- case 4. 초기 데이터를 빈 값으로 주고 개발시 사용했던 거래 데이터를 넣음

### 3. 해결 전략

사용자가 입력한 값들이 어떤 경우인지 하나씩 확인할 필요가 있었음.

#### 확인해야 할 사항

```
1. B, S 타입 여부
  2. 타입을 비교할 기준(B라면 S리스트, S라면 B리스트)이되는 거래리스트(Buy, Sell 2개) 여부 확인
    3. 거래리스트가 있음 (4~9를 반복하여 거래함)
      4. 거래 후, 더 거래할 개수가 남아있음
        5. 개수는 있으나 가격이 맞지 않음
          6. 10으로 이동하여 같은 타입 리스트에 등록
        7. 개수도 있고 가격도 맞음
          8. 4로 이동하여 계속 거래
      9. 거래 후, 더 거래할 개수가 남아있지 않음. 종료
    10. 거래리스트가 없음. 같은 타입의 리스트 비교 후 입력 (11~17을 반복하여 입력)
      11. 같은 타입 리스트 없음
        12. 새로운 값으로 추가. 종료
      13. 같은 타입 리스트 있음
        14. 같은 값이 있음
          15. 개수를 추가. 종료
        16. 같은 값이 없음
          17. 새로운 값으로 추가. 종료
```

위 여부들에 대해 비교하며 값을 넣어야 함. B리스트와 S리스트를 동시에 비교해야하는 경우는 없기 때문에
최악의 경우 빅오값은 `O(N)`이 나온다.

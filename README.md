# bitestServer

실시간으로 들어오는 매수, 매도에 대해서 호가창을 보여주는 어플리케이션

## Requirement

* 입력은 1초에 1건씩, 순서대로 (파일 입력)
* 가격은 정수, 가격은 100 ~ 999까지 (1원 단위)
* 체결가 : 거래 (매수, 매도)가 성사된 가격
  * 매수가 = 매도가 인경우 체결
  * 매수가가 매도가 보다 높은 경우 가장 낮은 매도가부터 수량만큼 체결
  * 매도가가 매수가 보다 낮은 경우 가장 높은 매수가부터 수량만큼 체결
* 현재가는 마지막 체결가

## Statement

* Node + Express
* 서버 로직 = **Websocket**, ~~LongPolling~~, ~~Rest~~
* [Front Repository](https://github.com/jicjjang/bitestFront)

## How to use

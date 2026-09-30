# Google Walletとは

Googleが提供するデジタルウォレット。Android端末（および対応するWear OS）で、支払いカード・チケット・会員証・搭乗券などを1か所にまとめて使えるアプリ。

ユーザー視点では「iPhoneのWalletアプリのGoogle版」、開発者視点では「パス（デジタル券面）を発行・更新するためのGoogle Wallet API」というイメージが近い。

公式:
- [Google Wallet（ユーザー向け）](https://wallet.google)
- [Google Wallet API（開発者向け）](https://developers.google.com/wallet)

## 何ができるか

ユーザーはGoogle Walletに次のようなものを入れておける。

- 支払いカード（対応店舗でタップ決済。受け入れ側はGoogle Pay）
- ポイントカード・ギフトカード・クーポン
- イベントチケット、映画・試合の入場券
- 搭乗券、交通系パス（対応路線のみ）
- 会員証、駐車券、保険証など専用タイプに当てはまらない券面（Generic pass）
- 一部地域・提携先に限るもの: デジタルID、学生証、車のデジタルキー、健康記録

開発者が触る「パス発行」は、このうちチケット・会員証・クーポンなどの券面が中心。支払いカードの追加やGoogle Payの決済ボタン実装は別プロダクト。

## Google Payとの違い

名前が似ていて混同しやすい。iOSでいう「Walletアプリ」と「Apple Pay」の関係に近い。

| | 役割 |
| --- | --- |
| Google Wallet | カードやパスを入れておくアプリ。券面の表示・更新・提示 |
| Google Pay | 決済サービス。店舗・Web・アプリでの支払い |

- ユーザーはWalletアプリからタップ決済できる（受け入れ側は「Google Payが使える店舗」と案内されることが多い）
- 開発者がパスを出すときは **Google Wallet API**
- 開発者が決済ボタンを出すときは **Google Pay API**
- 2022年にパス発行APIの名前が「Google Pay API for Passes」から「Google Wallet API」に変わった。古い資料は旧名のまま残っている

管理画面も共通で、[Google Pay & Wallet Console](https://pay.google.com/business/console) を使う。

## パスの考え方

Google Walletに入れる券面は、ほぼすべて次の2層で作る。

1. **Passes Class（テンプレート）**  
   イベント名、ロゴ、会場、デザインなど、同じ種類のパスで共通する情報。
2. **Passes Object（1枚分の実体）**  
   座席番号、QRコード、会員番号など、ユーザーごとに違う情報。

ユーザーが保存する1枚は「Class + Object」の合成結果。発行後にClassを直せば同じテンプレートのパス全体が変わり、Objectを直せばその1枚だけ変わる。

専用タイプがあるものはそれを使い、当てはまらなければGeneric passを使う。専用タイプのほうがリマインダーなどの機能が厚い。

対応している主なパスタイプ:

| タイプ | 用途 |
| --- | --- |
| Event ticket | イベント入場券 |
| Boarding pass (`flight`) | 航空の搭乗券 |
| Transit | 交通パス |
| Loyalty | ポイントカード・会員プログラム |
| Offer | クーポン・キャンペーン |
| Gift card | ギフトカード |
| Generic | 上記に当てはまらない券面（ジム会員、駐車券、保険証など） |
| Generic Private | 個人情報を含む券面。追加の保護あり |

専用タイプがあるのにGenericで似せるのは非推奨。例: 搭乗券をGenericにすると遅延通知などが乗らない。

## 参考リンク

- [Google Wallet API トップ](https://developers.google.com/wallet)
- [パスの開発フロー](https://developers.google.com/wallet/generic/overview/add-to-google-wallet-flow)
- [Generic pass](https://developers.google.com/wallet/generic)
- [FAQ](https://developers.google.com/wallet/retail/gift-cards/resources/faq)
- 実装の入口は [実装の全体像](./実装の全体像.md)
- iOSとの差は [iOS Walletとの比較](./iOS%20Walletとの比較.md)

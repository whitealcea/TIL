# iOS Walletとの比較

iPhoneのWallet（PassKit）とGoogle Walletは、ユーザーから見るとほぼ同じ仕事をする。支払いカードとデジタル券面を端末に入れて、QRやタップで提示する。中身の作り方は別物で、パスを相互に移すこともできない。

両方出すのが普通。iOSユーザーにはApple Wallet、AndroidユーザーにはGoogle Walletを配る。

公式:
- Apple: [PassKit](https://developer.apple.com/documentation/passkit) / [Wallet Passes](https://developer.apple.com/documentation/walletpasses)
- Google: [Google Wallet API](https://developers.google.com/wallet)

## 似ているところ

- 専用アプリを入れなくても、ウォレットに券面を保存できる
- ポイントカード、クーポン、ギフトカード、イベント券、搭乗券、会員証が主な用途
- QR / バーコード提示と、設定すればNFCタップ提示
- 発行後に券面を更新できる（残高、ゲート番号、有効期限など）
- Web・メール・SMS・QR経由で配布できる
- 日時や位置に応じてロック画面付近に出したり、リマインドしたりできる
- 保存済みパスはオフラインでも見せられる。最新情報の取得は通信が必要
- 支払い（Apple Pay / Google Pay）と、券面ウォレットは別レイヤー
- 一部地域ではデジタルIDや交通系も入る
- 期限切れパスはメイン一覧から外れることがあるが、すぐ消えるとは限らない

## 違うところ

### 対象端末

| | Apple Wallet | Google Wallet |
| --- | --- | --- |
| 主な端末 | iPhone / Apple Watch | Android 9以降 / 対応Wear OS |
| 相手OS向けアプリ | なし（Android用Apple Walletはない） | iPhone用Google Walletアプリはない |
| Webでの管理 | ほぼ端末上 | [wallet.google](https://wallet.google) で一部管理できる |

同じプログラムでも、保存先は端末のウォレットが決める。iPhoneで保存したパスをAndroidへ移す、その逆も、基本できない。機種変更したら発行元から作り直す。

### パスの実体

ここが実装で一番効く差。

| | Apple Wallet | Google Wallet |
| --- | --- | --- |
| 配布物 | 署名済み `.pkpass`（ZIP） | 署名済みJWTへのリンク、またはAndroid SDK |
| サーバー上の実体 | 発行側がパッケージを持つ。Appleはファイルを預かっていない | Class / Object がGoogle側に保存される |
| テンプレート | `pass.json` のスタイル1つ分 | Passes Class |
| 1枚分 | 同じパッケージ内のフィールド | Passes Object |
| 署名 | Pass Type ID証明書 | Cloudのサービスアカウント鍵（Web）、またはアプリ署名（Android SDK） |

Appleは「署名したファイルを配る」。Googleは「Google上のオブジェクトを、JWTでユーザーに紐づける」。

Appleの `.pkpass` に入るもの:

- `pass.json`
- 画像（icon、logo など）
- `manifest.json`
- `signature`

Googleの保存リンク:

```text
https://pay.google.com/gp/v/save/<signed_jwt>
```

iPhoneは `.pkpass` をOSが認識してWalletに入れる。Androidは保存用URLかアプリSDKを使う。QR配布も、中身は同じ差になる。

### パスタイプ

対応領域は重なるが、分類の切り方が違う。

Apple（`pass.json` のスタイル。どれか1つ）:

- `boardingPass`
- `coupon`
- `eventTicket`
- `storeCard`（ポイント・ギフトなど）
- `generic`

Google（Class / Object の種類）:

- Event ticket
- Boarding pass（航空は `flight`）
- Transit（交通は専用タイプがある）
- Loyalty
- Offer
- Gift card（ギフトは独立タイプ）
- Generic / Generic Private

ざっくり対応させると:

| Apple | Google |
| --- | --- |
| `eventTicket` | `eventTicketClass` / `eventTicketObject` |
| `boardingPass` | `flightClass` / `flightObject`（交通は `transit`） |
| `coupon` | `offerClass` / `offerObject` |
| `storeCard` | `loyalty` または `giftCard` |
| `generic` | `genericClass` / `genericObject` |

見た目はコピーしない方がよい。Appleはテンプレ固定が強く、Googleはフィールド配置の自由度が高い。

### 更新の仕組み

発行後の更新も、流れが逆。

Apple:

1. パスに `webServiceURL` と `authenticationToken` を入れておく
2. 端末が発行元サーバーに登録する
3. 発行元がAPNsで「変わった」と空プッシュする
4. 端末が新しい `.pkpass` を取りに来る

つまり更新用Webサービスを自分で持つ。

Google:

1. REST APIで Class または Object を `PATCH` / `PUT`
2. Googleが端末側の表示を更新する

発行元がGoogle APIを叩けばよく、端末向けプッシュ基盤は自分で持たない。  
ただし **開発者独自のプッシュ文面は出せない**。出る通知はパスタイプごとの組み込み（イベント3時間前、オファー期限48時間前、搭乗券のゲート変更など）。

### NFC

どちらも「パスなら誰でもタップ」ではない。パス側の設定と、対応リーダーが要る。

| | Apple | Google |
| --- | --- | --- |
| プロトコル | Apple VAS | Smart Tap |
| 追加条件 | NFC entitlement。用途審査がある | Redemption Issuer ID、Collector ID、認証鍵、対応端末 |
| 決済NFCとの関係 | Apple Pay対応だけでは足りない | Google Pay対応だけでは足りない |

QR運用ならこの差は後回しにできる。タップ運用にするなら端末・審査・鍵が別物。

### 通知・ロック画面

- Apple: 日時、位置情報、BLEビーコンで関連パスをロック画面に出せる
- Google: Nearby Passes（ジオフェンス）と、パスタイプごとの組み込み通知
- Appleはパス更新そのものをプッシュのトリガーにできる
- Googleは「開発者が任意の文言で推す」用途には使えない

### アカウントと審査

| | Apple | Google |
| --- | --- | --- |
| 開発者登録 | Apple Developer Program | Google Pay & Wallet Console のIssuer |
| 証明書 | Pass Type ID | サービスアカウント / アプリ署名フィンガープリント |
| 本番 | 証明書が有効なら配布できる | 最初はデモモード（テストユーザーのみ）。公開は審査 |
| NFCパス | 別途Appleの審査 | Smart Tapの設定と対応リーダー |

### そのほか実装で引っかかりやすい点

- Class / Object はGoogle側で削除できない。ユーザーがウォレットから外すことはできる
- Google Wallet APIはおおむね 20リクエスト/秒
- パス上の画像はHTTPSのPNG。リダイレクトや個人写真は不可
- JWT保存リンクが長すぎるとブラウザ制限に当たる。そのときはClass / Objectを先にAPIで作って、JWTにはIDだけ入れる
- GoogleにはWeb管理画面がある。Appleのパス管理は端末中心

## 実装を両方やるときの捉え方

ビジネス上は1つのプログラム（会員、チケット、クーポン）でよい。ウォレットに入れる実体は2系統。

- 顧客データ、残高、券面文言は共通で持つ
- iOS向けは `.pkpass` を署名して配る
- Android向けは Class / Object を作り、JWTまたはSDKで保存させる
- 更新も、Appleは自前Webサービス + APNs、GoogleはWallet API、と分岐する

パス変換（Pass Converter）の話はあるが、保存済みパスをユーザーがウォレット間で移す機能ではない。発行時点で両方出すのが基本。

## 参考リンク

- [PassKit](https://developer.apple.com/documentation/passkit)
- [Updating a Pass（Apple, archive）](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Updating.html)
- [Adding a Web Service to Update Passes](https://developer.apple.com/documentation/WalletPasses/adding-a-web-service-to-update-passes)
- [Pass Design and Creation](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html)
- [Google Wallet 開発フロー](https://developers.google.com/wallet/generic/overview/add-to-google-wallet-flow)
- [Smart Tap](https://developers.google.com/wallet/smart-tap/introduction/communication-flow)
- 実装の入口は [実装の全体像](./実装の全体像.md)

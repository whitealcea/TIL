# MacのターミナルとVSCodeのターミナル設定

## 結論
macとvscodeで扱っている$PATHの内容が違っていたので合わせた。
なんで違っているのかは不明なまま。。。

## 背景
macのターミナルとVSCodeのターミナルで得られる結果が異なる。
`python --version` の実行結果が
mac : Python 3.7.4
vscode : Python 2.7.x

macの.bash_profile のPATHは書き換えたので、vscodeでも同じ結果が得られると思っていた。
どちらも同じ結果が得られるようにしたい。

## 確認
macのターミナルから anacondaのpythonにパスを通したことは覚えていた
一応macの`echo $PATH`で得られる結果を確認し、確かにanacondaにパスが通っていることを確認。
次にvscodeのターミナルで同一コマンドを実行。結果が違う。

## 対応
macのターミナルで`echo $PATH`で得られた結果をコピー。
vscodeのターミナルにて`export PATH=<コピー内容>`を実行。
versionを確認したらバージョンが揃った。

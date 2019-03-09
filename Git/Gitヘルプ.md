# Gitヘルプ
Git操作上で生じた問題に対する対処方法を記載する

## pushができない

### リモートブランチが存在しない
- リモートブランチが存在しない状態でpushすると以下のエラーが出る

```console
$ git push
  fatal: The current branch master has no upstream branch.
  To push the current branch and set the remote as upstream, use

  git push --set-upstream origin master
```

- こちらはローカルのmasterブランチをpushしようと下がリモートに存在していないため、発生しているエラー
- エラー内容通り、`--set-upstream origin master`を付加すればリモートにもmasterブランチが作成されpushが可能となる

### リモートブランチが先行している
- 以下のエラーが出る(TODO：エラーメッセージは未確認、確認でき次第追記する)

```console
$ git push

```

- ローカルに落としてきた後に、リモートに変更が加えられると発生する場合がある
- リモートの最新状態を持って来ることで解決できる
  - `git pull`、`git fetch & git merge`などでローカルを最新状態にする
- ※ 複数人で作業している場合に発生しやすい
  - そもそも複数人で作業する場合はブランチを分けた方が良い

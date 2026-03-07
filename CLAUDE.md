# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

知的障害者向けアンケートシステム。
単一の `index.html` にHTML・CSS・JavaScriptをすべて内包したシングルファイル構成。

## 起動方法

ビルド不要。`index.html` をブラウザで直接開くか、ローカルHTTPサーバーで配信する。

```bash
# 簡易サーバー例
python3 -m http.server 8080
# → http://localhost:8080/ でアクセス
```

## 管理者画面

URL に `?admin` を付けるとアクセスできる。
例: `http://localhost:8080/?admin`

## アーキテクチャ

| 要素 | 詳細 |
|---|---|
| 構成 | 単一ファイル `index.html`（HTML / CSS / JS） |
| データ永続化 | `localStorage`（キー: `nichiyo_survey_results`） |
| 画面切替 | `.screen` クラスに `.active` を付け外しするだけ |
| 質問定義 | `QUESTIONS` 配列（先頭から順に表示） |
| 選択肢定義 | `CHOICES` 配列（score: 5=最高, 1=最低、インデックス0が score 5） |

### 重要な実装ルール

- `CHOICES[5 - score]` でスコアから絵文字・ラベルを逆引きする（score=5 → index 0）
- `counts[score - 1]` でスコアを件数配列にマッピングする（score=1 → index 0）
- 二重タップ防止のため `busy` フラグを 220ms 保持する
- CSV エクスポートは BOM 付き UTF-8（Excel の文字化け対策）

## 管理者画面の機能

| 機能 | 関数 | 説明 |
|---|---|---|
| アンケート作成 | `onCreateSurvey()` | `prompt()` で名前を入力して新規作成 |
| アンケート名変更 | `onRenameSurvey(id)` | `prompt()` で既存の名前を編集 |
| アンケート削除 | `onDeleteSurvey(id)` | 表示中のアンケートは削除不可 |
| 有効化 | `onSetActive(id)` | 回答画面に表示するアンケートを切替 |
| 詳細表示 | `onOpenDetail(id)` | 結果・設問編集ビューへ遷移 |

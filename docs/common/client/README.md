# Common Client

Common モジュールのクライアントサイド実装です。React/Next.js アプリケーションで使用される共通コンポーネント、フック、ユーティリティを提供します。

## 概要

Common Client は以下の機能を提供します：

- **共通UIコンポーネント**: Material-UI ベースの再利用可能コンポーネント
- **認証システム**: クライアントサイド認証とセッション管理
- **API 通信**: 統一されたAPI通信インターフェース
- **状態管理**: React フック・コンテキストベースの状態管理
- **ユーティリティ**: クライアント固有のヘルパー関数

## アーキテクチャ

### Directory Structure

```
client/common/
├── components/           # 共通UIコンポーネント
│   ├── Layout/          # レイアウトコンポーネント
│   │   └── Stacks/      # スタックレイアウト
│   └── inputs/          # 入力コンポーネント
│       └── Selects/     # セレクトボックス
├── hooks/               # カスタムReactフック
├── services/            # API通信サービス
├── utils/               # クライアント用ユーティリティ
├── auth/                # 認証関連
├── interfaces/          # TypeScript インターフェース
├── pages/               # ページコンポーネント
└── routes/              # ルーティング設定
```

## 主要コンポーネント

### UI Components

#### Layout Components

##### BasicStack
基本的な垂直スタックレイアウトを提供します。

```typescript
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';

<BasicStack>
  <div>Content 1</div>
  <div>Content 2</div>
  <div>Content 3</div>
</BasicStack>
```

**特徴:**
- Material-UI Stack をベースとした実装
- レスポンシブ対応
- 自動スペーシング

##### DirectionStack
水平・垂直方向を制御できるスタックレイアウトです。

```typescript
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';

<DirectionStack direction="row" spacing={2}>
  <div>Item 1</div>
  <div>Item 2</div>
</DirectionStack>
```

**Props:**
- `direction`: 'row' | 'column'
- `spacing`: number
- `justifyContent`: FlexBox justify-content 値
- `alignItems`: FlexBox align-items 値

#### Input Components

##### BasicSelect
統一されたセレクトボックスコンポーネントです。

```typescript
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import { SelectOptionType } from '@client-common/interfaces/SelectOptionType';

const options: SelectOptionType[] = [
  { label: 'Option 1', value: 'opt1' },
  { label: 'Option 2', value: 'opt2' }
];

<BasicSelect 
  label="選択してください"
  options={options}
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
/>
```

**Props:**
- `label`: string - ラベルテキスト
- `options`: SelectOptionType[] - 選択肢配列
- `value`: string - 現在の選択値
- `onChange`: (value: string) => void - 変更ハンドラー

**特徴:**
- Material-UI Select をベース
- 型安全な選択肢管理
- アクセシビリティ対応

### Authentication

#### Auth Hooks
認証状態を管理するカスタムフックです。

```typescript
import { useAuth } from '@client-common/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }
  
  return <AuthenticatedContent user={user} />;
};
```

**提供機能:**
- 認証状態の監視
- ログイン・ログアウト処理
- ユーザー情報管理
- セッション管理

#### Auth Context
アプリケーション全体で認証状態を共有するコンテキストです。

```typescript
import { AuthProvider } from '@client-common/auth/AuthContext';

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        {/* ルート定義 */}
      </Routes>
    </Router>
  </AuthProvider>
);
```

### API Services

#### Base API Service
統一されたAPI通信の基底クラスです。

```typescript
import BaseAPIService from '@client-common/services/BaseAPIService';

class MyAPIService extends BaseAPIService {
  constructor() {
    super('/api/my-endpoint');
  }
  
  async getMyData(): Promise<MyDataType[]> {
    return await this.get<MyDataType[]>('/data');
  }
  
  async createMyData(data: MyDataType): Promise<void> {
    await this.post('/data', data);
  }
}
```

**機能:**
- HTTP メソッドの統一ラッパー
- エラーハンドリング
- レスポンス型安全性
- リクエスト・レスポンスインターセプター

#### HTTP Client
HTTP通信のユーティリティを提供します。

```typescript
import { HttpClient } from '@client-common/utils/HttpClient';

const client = new HttpClient({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const response = await client.get<DataType>('/endpoint');
```

### Custom Hooks

#### useAsync
非同期処理を管理するフックです。

```typescript
import { useAsync } from '@client-common/hooks/useAsync';

const MyComponent = () => {
  const { data, loading, error, execute } = useAsync(
    () => apiService.fetchData(),
    []
  );
  
  if (loading) return <Loading />;
  if (error) return <Error error={error} />;
  if (!data) return <NoData />;
  
  return <DataDisplay data={data} />;
};
```

#### useLocalStorage
ローカルストレージとの統合フックです。

```typescript
import { useLocalStorage } from '@client-common/hooks/useLocalStorage';

const MyComponent = () => {
  const [settings, setSettings] = useLocalStorage('userSettings', defaultSettings);
  
  return (
    <SettingsForm 
      settings={settings}
      onSave={setSettings}
    />
  );
};
```

#### useDebounce
入力値のデバウンス処理を行うフックです。

```typescript
import { useDebounce } from '@client-common/hooks/useDebounce';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="検索..."
    />
  );
};
```

## Utilities

### Form Utilities
フォーム処理のユーティリティを提供します。

```typescript
import { FormValidator } from '@client-common/utils/FormValidator';

const validator = new FormValidator();
validator.addRule('email', 'required|email');
validator.addRule('password', 'required|minLength:8');

const errors = validator.validate(formData);
```

### Date/Time Utilities
クライアントサイド日付・時間処理を提供します。

```typescript
import { DateFormatter } from '@client-common/utils/DateFormatter';

const formatter = new DateFormatter('ja-JP');
const formattedDate = formatter.format(new Date(), 'YYYY年MM月DD日');
```

### Storage Utilities
ブラウザストレージの統一インターフェースです。

```typescript
import { StorageUtil } from '@client-common/utils/StorageUtil';

// セッションストレージ
StorageUtil.session.set('key', data);
const sessionData = StorageUtil.session.get('key');

// ローカルストレージ
StorageUtil.local.set('key', data);
const localData = StorageUtil.local.get('key');
```

## Material-UI Integration

### Theme Configuration
Material-UI テーマの統一設定を提供します。

```typescript
import { createTheme } from '@mui/material/styles';
import { commonTheme } from '@client-common/styles/theme';

const theme = createTheme({
  ...commonTheme,
  // アプリ固有のカスタマイズ
});
```

### Custom Components
Material-UI をベースとしたカスタムコンポーネントです。

#### EnhancedButton
拡張されたボタンコンポーネントです。

```typescript
import EnhancedButton from '@client-common/components/EnhancedButton';

<EnhancedButton
  variant="contained"
  color="primary"
  loading={isLoading}
  onClick={handleClick}
>
  実行
</EnhancedButton>
```

#### LoadingSpinner
統一されたローディング表示コンポーネントです。

```typescript
import LoadingSpinner from '@client-common/components/LoadingSpinner';

<LoadingSpinner 
  size="large"
  message="データを読み込み中..."
/>
```

## State Management

### Context Providers
グローバル状態管理のためのコンテキストプロバイダーです。

#### NotificationProvider
通知機能を提供します。

```typescript
import { useNotification } from '@client-common/contexts/NotificationContext';

const MyComponent = () => {
  const { showNotification } = useNotification();
  
  const handleSuccess = () => {
    showNotification('成功しました', 'success');
  };
  
  const handleError = () => {
    showNotification('エラーが発生しました', 'error');
  };
};
```

#### ThemeProvider
テーマ切り替え機能を提供します。

```typescript
import { useTheme } from '@client-common/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button onClick={toggleTheme}>
      {theme === 'light' ? 'ダーク' : 'ライト'}モード
    </Button>
  );
};
```

## Type Definitions

### Common Interfaces

#### SelectOptionType
セレクトボックスの選択肢型定義です。

```typescript
export interface SelectOptionType {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
}
```

#### ApiResponse
API レスポンスの共通型定義です。

```typescript
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}
```

#### PaginatedResponse
ページネーション付きレスポンスの型定義です。

```typescript
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Testing

### Component Testing
共通コンポーネントのテスト支援を提供します。

```typescript
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '@client-common/testing/TestWrapper';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <TestWrapper>
      {component}
    </TestWrapper>
  );
};
```

### Mock Services
テスト用のモックサービスを提供します。

```typescript
import { MockAPIService } from '@client-common/testing/MockAPIService';

const mockService = new MockAPIService();
mockService.mockGet('/api/data', mockData);
```

## Performance Optimization

### Code Splitting
コンポーネントの動的インポートを支援します。

```typescript
import { lazy } from 'react';
const LazyComponent = lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyComponent />
  </Suspense>
);
```

### Memoization Utilities
メモ化ヘルパーを提供します。

```typescript
import { useMemoizedCallback } from '@client-common/hooks/useMemoizedCallback';

const ExpensiveComponent = ({ data, onUpdate }) => {
  const memoizedCallback = useMemoizedCallback(
    (item) => onUpdate(processItem(item)),
    [onUpdate]
  );
  
  return data.map(item => (
    <Item key={item.id} data={item} onClick={memoizedCallback} />
  ));
};
```

## 使用例

### 基本的なコンポーネント構成

```typescript
import React from 'react';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import BasicSelect from '@client-common/components/inputs/Selects/BasicSelect';
import { useAuth } from '@client-common/hooks/useAuth';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return (
    <BasicStack>
      <DirectionStack direction="row" justifyContent="space-between">
        <h1>ダッシュボード</h1>
        <UserMenu user={user} />
      </DirectionStack>
      
      <DirectionStack direction="row" spacing={2}>
        <BasicSelect 
          label="フィルター"
          options={filterOptions}
          value={filter}
          onChange={setFilter}
        />
        <RefreshButton onClick={handleRefresh} />
      </DirectionStack>
      
      <DashboardContent />
    </BasicStack>
  );
};
```

## 関連ドキュメント

- [Common Module Overview](../README.md)
- [Server Documentation](../server/README.md)
- [Finance Client Documentation](../../finance/client/README.md)
- [Material-UI Documentation](https://mui.com/)
- [React Documentation](https://reactjs.org/)
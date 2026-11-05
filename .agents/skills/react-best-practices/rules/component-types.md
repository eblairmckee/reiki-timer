# React component type contracts

Use the shared [TypeScript contracts](../../typescript/rules/contracts.md) for public types and untrusted data boundaries.

Reuse native prop and event types for wrappers, with intentional overrides. Preserve the ref contract supported by the installed React version. In React 19 and later, new function components can accept a ref prop using the matching native element types. Preserve `forwardRef` where older React versions or the supported library contract require it. Read provider context with `useContext`.

Forward consumer props and refs to the semantic element promised by the API. Preserve field identity, accessible relationships, styling hooks, and event behavior through wrappers. Compose library and consumer handlers through the selected library's supported mechanism, preserving its cancellation semantics.

When the library supports `asChild` or a slot primitive, use it to combine behaviors on the intended focusable element. The custom leaf must pass through the required props and ref. Follow the shared [interaction contract](../../accessible-testing/rules/accessibility.md) for the resulting control. Verify the actual rendered DOM and focus behavior when changing its element type.

## React providers and compound components

Use a provider when independently composed parts need coordinated state across the component tree. Place it at the nearest shared owner, including siblings outside the main visual frame. Keep ordinary props for simpler relationships. Avoid synchronizing duplicate state upward through Effects or reading render state from imperative refs.

Define the context contract around the state and actions consumers need. Add metadata or refs when the interaction needs them. A provider may implement that contract with local state or the application's existing store; reusable parts consume the contract. Check for a missing provider at the consumer boundary.

This React DOM example shares one query between a form and a sibling preview. Native form submission handles Enter and button activation. The provider owns state, and children determine the form's structure.

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";

type SearchContextValue = {
  state: { query: string };
  actions: {
    changeQuery: (query: string) => void;
    submit: () => void;
  };
};

type SearchProviderProps = {
  children: ReactNode;
  initialQuery?: string;
  onSearch: (query: string) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

function useSearch() {
  const value = useContext(SearchContext);
  if (value === null) throw new Error("Search requires Search.Provider");
  return value;
}

function SearchProvider({
  children,
  initialQuery = "",
  onSearch,
}: SearchProviderProps) {
  const [query, changeQuery] = useState(initialQuery);
  const value: SearchContextValue = {
    state: { query },
    actions: { changeQuery, submit: () => onSearch(query) },
  };
  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

function SearchForm({ children }: { children: ReactNode }) {
  const { actions } = useSearch();
  return (
    <form
      role="search"
      aria-label="Catalog"
      onSubmit={(event) => {
        event.preventDefault();
        actions.submit();
      }}
    >
      {children}
    </form>
  );
}

function SearchInput() {
  const { state, actions } = useSearch();
  return (
    <label>
      Search
      <input
        type="search"
        name="q"
        value={state.query}
        onChange={(event) => actions.changeQuery(event.currentTarget.value)}
      />
    </label>
  );
}

export const Search = {
  Provider: SearchProvider,
  Form: SearchForm,
  Input: SearchInput,
};

function QueryPreview() {
  const { state } = useSearch();
  return <p>Current query: {state.query}</p>;
}

export function SearchExample({
  onSearch,
}: Pick<SearchProviderProps, "onSearch">) {
  return (
    <Search.Provider onSearch={onSearch}>
      <Search.Form>
        <Search.Input />
        <button type="submit">Search catalog</button>
      </Search.Form>
      <QueryPreview />
    </Search.Provider>
  );
}
```

The initial query is an uncontrolled default. A controlled version would take its current value and change callback from its owner. Keep any async search lifecycle and error feedback in the application data layer. Scope context and stabilize identities further when actual consumers or measured rendering cost call for it.
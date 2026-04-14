const SESSION_KEY = 'sb_session';

const parseJson = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
};

class QueryBuilder {
  constructor(client, table) {
    this.client = client;
    this.table = table;
    this.method = 'GET';
    this.filters = [];
    this.headers = {};
    this.params = new URLSearchParams();
    this.body = null;
    this.singleMode = null;
    this.count = null;
  }

  select(columns = '*', options = {}) {
    this.params.set('select', columns);
    if (options.head) this.method = 'HEAD';
    if (options.count) this.count = options.count;
    return this;
  }

  insert(payload) { this.method = 'POST'; this.body = payload; return this; }
  update(payload) { this.method = 'PATCH'; this.body = payload; return this; }
  upsert(payload, options = {}) {
    this.method = 'POST'; this.body = payload;
    this.headers.Prefer = 'resolution=merge-duplicates,return=representation';
    if (options.onConflict) this.params.set('on_conflict', options.onConflict);
    return this;
  }
  delete() { this.method = 'DELETE'; return this; }

  eq(col, val) { this.params.append(col, `eq.${val}`); return this; }
  lte(col, val) { this.params.append(col, `lte.${val}`); return this; }
  or(clause) { this.params.set('or', `(${clause})`); return this; }
  order(col, { ascending = true } = {}) { this.params.set('order', `${col}.${ascending ? 'asc' : 'desc'}`); return this; }
  limit(n) { this.params.set('limit', n); return this; }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybeSingle'; return this; }

  then(resolve, reject) { return this.execute().then(resolve, reject); }

  async execute() {
    const url = `${this.client.url}/rest/v1/${this.table}?${this.params.toString()}`;
    const headers = {
      apikey: this.client.anonKey,
      Authorization: this.client.session?.access_token ? `Bearer ${this.client.session.access_token}` : `Bearer ${this.client.anonKey}`,
      'Content-Type': 'application/json',
      ...this.headers,
    };
    if (this.count) headers.Prefer = `${headers.Prefer ? `${headers.Prefer},` : ''}count=${this.count}`;
    if (this.singleMode === 'single') headers.Accept = 'application/vnd.pgrst.object+json';
    if (this.singleMode === 'maybeSingle') headers.Accept = 'application/vnd.pgrst.object+json';

    const res = await fetch(url, { method: this.method, headers, body: this.body ? JSON.stringify(this.body) : undefined });
    if (!res.ok && !(this.singleMode === 'maybeSingle' && res.status === 406)) {
      const errorBody = await parseJson(res);
      return { data: null, error: { message: errorBody?.message || res.statusText }, count: null };
    }
    const countHeader = res.headers.get('content-range');
    const count = countHeader ? Number(countHeader.split('/')[1]) : null;
    if (this.method === 'HEAD') return { data: null, error: null, count };
    const data = await parseJson(res);
    return { data: data ?? (this.singleMode === 'maybeSingle' ? null : []), error: null, count };
  }
}

export const createClient = (url, anonKey) => {
  const listeners = [];
  const client = {
    url,
    anonKey,
    session: JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'),
    auth: {
      getSession: async () => ({ data: { session: client.session }, error: null }),
      onAuthStateChange: (cb) => {
        listeners.push(cb);
        return { data: { subscription: { unsubscribe: () => listeners.splice(listeners.indexOf(cb), 1) } } };
      },
      signUp: async ({ email, password, options }) => {
        const res = await fetch(`${url}/auth/v1/signup`, { method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, data: options?.data }) });
        const json = await parseJson(res);
        if (!res.ok) return { data: null, error: { message: json?.msg || json?.message || 'Signup failed' } };
        return { data: json, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const res = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const json = await parseJson(res);
        if (!res.ok) return { data: null, error: { message: json?.error_description || 'Login failed' } };
        client.session = json;
        localStorage.setItem(SESSION_KEY, JSON.stringify(json));
        listeners.forEach((cb) => cb('SIGNED_IN', json));
        return { data: { user: json.user, session: json }, error: null };
      },
      signOut: async () => {
        client.session = null;
        localStorage.removeItem(SESSION_KEY);
        listeners.forEach((cb) => cb('SIGNED_OUT', null));
        return { error: null };
      },
      resetPasswordForEmail: async (email, { redirectTo }) => {
        const res = await fetch(`${url}/auth/v1/recover`, { method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, redirect_to: redirectTo }) });
        if (!res.ok) {
          const json = await parseJson(res);
          return { error: { message: json?.message || 'Reset failed' } };
        }
        return { error: null };
      },
    },
    from: (table) => new QueryBuilder(client, table),
    storage: {
      from: (bucket) => ({
        upload: async (path, file) => {
          const res = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
            method: 'POST',
            headers: {
              apikey: anonKey,
              Authorization: client.session?.access_token ? `Bearer ${client.session.access_token}` : `Bearer ${anonKey}`,
              'x-upsert': 'false',
            },
            body: file,
          });
          if (!res.ok) {
            const j = await parseJson(res);
            return { data: null, error: { message: j?.message || 'Upload failed' } };
          }
          return { data: { path }, error: null };
        },
        remove: async (paths) => {
          const res = await fetch(`${url}/storage/v1/object/${bucket}`, {
            method: 'DELETE',
            headers: {
              apikey: anonKey,
              Authorization: client.session?.access_token ? `Bearer ${client.session.access_token}` : `Bearer ${anonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prefixes: paths }),
          });
          if (!res.ok) {
            const j = await parseJson(res);
            return { data: null, error: { message: j?.message || 'Delete failed' } };
          }
          return { data: true, error: null };
        },
        getPublicUrl: (path) => ({ data: { publicUrl: `${url}/storage/v1/object/public/${bucket}/${path}` } }),
      }),
    },
  };
  return client;
};

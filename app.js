// 環境変数から Supabase の URL と ANON key を取得
// Node + バンドラー（Vite, Webpack など）使用前提
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// HTML 要素
const authDiv = document.getElementById('auth');
const appDiv = document.getElementById('app');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const saveNoteBtn = document.getElementById('saveNote');
const notesList = document.getElementById('notesList');

let currentUser = null;

// ログイン状態チェック
supabase.auth.getSession().then(({ data }) => {
  if (data.session) {
    currentUser = data.session.user;
    showApp();
  }
});

function showApp() {
  authDiv.style.display = 'none';
  appDiv.style.display = 'block';
  fetchNotes();
}

function showAuth() {
  authDiv.style.display = 'block';
  appDiv.style.display = 'none';
}

// 登録
signupBtn.addEventListener('click', async () => {
  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) alert(error.message);
  else alert('登録完了！メールを確認してください。');
});

// ログイン
loginBtn.addEventListener('click', async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) alert(error.message);
  else {
    currentUser = data.user;
    showApp();
  }
});

// ログアウト
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  currentUser = null;
  showAuth();
});

// メモ保存
saveNoteBtn.addEventListener('click', async () => {
  if (!currentUser) return;
  await supabase
    .from('notes')
    .insert([{
      user_id: currentUser.id,
      title: noteTitle.value,
      content: noteContent.value
    }]);
  noteTitle.value = '';
  noteContent.value = '';
  fetchNotes();
});

// 自分のメモ取得
async function fetchNotes() {
  if (!currentUser) return;
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
  
  notesList.innerHTML = '';
  data.forEach(note => {
    const li = document.createElement('li');
    li.textContent = `${note.title}: ${note.content}`;
    notesList.appendChild(li);
  });
}


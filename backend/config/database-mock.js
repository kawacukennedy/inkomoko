/* ============================================================
   In-Memory Mock Database
   Simulates PostgreSQL for testing without a real DB
   ============================================================ */

const bcrypt = require('bcryptjs');

// In-memory data store
const store = {
  users: [],
  families: [],
  family_members: [],
  stories: [],
  story_tags: [],
  bookmarks: [],
  gratitudes: [],
  comments: [],
  play_history: [],
  followers: [],
  notifications: [],
  user_settings: [],
};

// UUID generator
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Seed data
async function seedData() {
  const hash = await bcrypt.hash('inkomoko123', 10);

  // Elders
  const elders = [
    { id: 'a1000000-0000-0000-0000-000000000001', full_name: 'Gakwaya', email: 'gakwaya@inkomoko.rw', phone: '+250788000001', password_hash: hash, role: 'elder', region: 'Northern Province', province: 'Musanze', language_pref: 'kinyarwanda', cultural_background: ['Umuco w\'u Rwanda', 'Abagabo'], bio: 'A storyteller and keeper of oral traditions from the hills of Musanze.', clan: 'Abanyiginya', age: 78, is_onboarded: true, avatar_url: null, voice_intro_url: null, interests: [], created_at: new Date('2024-01-15').toISOString(), updated_at: new Date().toISOString() },
    { id: 'a1000000-0000-0000-0000-000000000002', full_name: 'Mzee Karekezi', email: 'karekezi@inkomoko.rw', phone: '+250788000002', password_hash: hash, role: 'elder', region: 'Southern Province', province: 'Nyanza', language_pref: 'kinyarwanda', cultural_background: ['Umuco w\'u Rwanda'], bio: 'Keeper of 12 Traditions, master of the weaving arts.', clan: 'Abega', age: 82, is_onboarded: true, avatar_url: null, voice_intro_url: null, interests: [], created_at: new Date('2024-02-10').toISOString(), updated_at: new Date().toISOString() },
    { id: 'a1000000-0000-0000-0000-000000000003', full_name: 'Mzee Kanyamahanga', email: 'kanyamahanga@inkomoko.rw', phone: '+250788000003', password_hash: hash, role: 'elder', region: 'Southern Province', province: 'Nyanza', language_pref: 'kinyarwanda', cultural_background: ['Umuco w\'u Rwanda', 'Inyambo'], bio: 'Master storyteller and keeper of oral traditions of the Nyanza royal court.', clan: 'Abanyiginya', age: 84, is_onboarded: true, avatar_url: null, voice_intro_url: null, interests: [], created_at: new Date('2024-01-20').toISOString(), updated_at: new Date().toISOString() },
    { id: 'a1000000-0000-0000-0000-000000000004', full_name: 'Nyirahirwa', email: 'nyirahirwa@inkomoko.rw', phone: '+250788000004', password_hash: hash, role: 'elder', region: 'Eastern Province', province: 'Kayonza', language_pref: 'kinyarwanda', cultural_background: ['Umuco w\'u Rwanda'], bio: 'Grandmother and keeper of recipes and songs.', clan: 'Abagesera', age: 74, is_onboarded: true, avatar_url: null, voice_intro_url: null, interests: [], created_at: new Date('2024-03-05').toISOString(), updated_at: new Date().toISOString() },
    { id: 'a1000000-0000-0000-0000-000000000005', full_name: 'Munyana', email: 'munyana@inkomoko.rw', phone: '+250788000005', password_hash: hash, role: 'elder', region: 'Western Province', province: 'Rubavu', language_pref: 'kinyarwanda', cultural_background: ['Umuco w\'u Rwanda'], bio: 'Great uncle, teller of cattle and kings.', clan: 'Abanyiginya', age: 80, is_onboarded: true, avatar_url: null, voice_intro_url: null, interests: [], created_at: new Date('2024-02-20').toISOString(), updated_at: new Date().toISOString() },
    { id: 'a1000000-0000-0000-0000-000000000006', full_name: 'Mzee Mutabazi', email: 'mutabazi@inkomoko.rw', phone: '+250788000006', password_hash: hash, role: 'elder', region: 'Southern Province', province: 'Nyanza', language_pref: 'kinyarwanda', cultural_background: ['Umuco w\'u Rwanda'], bio: 'Chronicler of the nomadic cattle herding cycles.', clan: 'Abega', age: 76, is_onboarded: true, avatar_url: null, voice_intro_url: null, interests: [], created_at: new Date('2024-03-15').toISOString(), updated_at: new Date().toISOString() },
  ];

  // Youth
  const youth = [
    { id: 'b1000000-0000-0000-0000-000000000001', full_name: 'Keza', email: 'keza@inkomoko.rw', phone: '+250788100001', password_hash: hash, role: 'youth', region: 'Kigali', province: 'Kigali', language_pref: 'english', cultural_background: [], bio: 'Young listener passionate about preserving family stories.', clan: null, age: 22, is_onboarded: true, avatar_url: null, voice_intro_url: null, interests: ['Stories', 'Songs'], created_at: new Date('2024-04-01').toISOString(), updated_at: new Date().toISOString() },
    { id: 'b1000000-0000-0000-0000-000000000002', full_name: 'Balthazar Mugisha', email: 'b.mugisha@livingarchive.rw', phone: '+250788100002', password_hash: hash, role: 'youth', region: 'Kigali', province: 'Kigali', language_pref: 'english', cultural_background: [], bio: null, clan: null, age: 28, is_onboarded: true, avatar_url: null, voice_intro_url: null, interests: [], created_at: new Date('2024-05-10').toISOString(), updated_at: new Date().toISOString() },
  ];

  store.users = [...elders, ...youth];

  // Stories  
  store.stories = [
    { id: 's1000000-0000-0000-0000-000000000001', title: "Ubutwari bwa Data mu gihe cy'isarura", description: 'The bravery of our father during the harvest season.', author_id: elders[0].id, audio_url: null, text_content: null, category: 'story', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 924, era: '1974', cover_image_url: null, transcript_kinyarwanda: '"Muri icyo gihe, imisozi yacu yari itoshye cyane. Inka zabaga zifite ibyatsi bihagije, kandi amazi yatemba mu mibande yari afutuye."', transcript_english: '"During that time, our hills were very lush. The cattle had plenty of grass, and the water flowing in the valleys was crystal clear."', play_count: 42, gratitude_count: 15, family_id: null, created_at: new Date('2024-06-01').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000002', title: "Imigenzo y'Inka n'Amata", description: 'The customs of cattle and milk in Rwandan culture.', author_id: elders[0].id, audio_url: null, text_content: null, category: 'tradition', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 720, era: '1960', cover_image_url: null, transcript_kinyarwanda: '"Nari nkiri muto ubwo sogokuru yanyigishaga uburyo amata yubaha umuryango."', transcript_english: '"I was still young when my grandfather taught me how milk honors the family."', play_count: 38, gratitude_count: 12, family_id: null, created_at: new Date('2024-06-10').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000003', title: "Izina ryawe rifite intego", description: 'The story behind our family names.', author_id: elders[0].id, audio_url: null, text_content: null, category: 'culture', language: 'kinyarwanda', visibility: 'family', status: 'published', duration_seconds: 330, era: null, cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 18, gratitude_count: 8, family_id: null, created_at: new Date('2024-06-15').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000005', title: 'The Cattle and the Kings', description: 'How cattle shaped the destiny of Rwandan kingdoms.', author_id: elders[4].id, audio_url: null, text_content: null, category: 'story', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 765, era: '1940', cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 56, gratitude_count: 22, family_id: null, created_at: new Date('2024-07-01').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000006', title: 'The Weaving of Inkomoko', description: 'The deep cultural significance of weaving in Rwandan heritage.', author_id: elders[1].id, audio_url: null, text_content: null, category: 'tradition', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 924, era: 'June 1952', cover_image_url: null, transcript_kinyarwanda: '"Muri icyo gihe, imisozi yacu yari itoshye cyane." "Abasaza bacu batwigishaga ko Inkomoko ari yo nkingi ya mwamba y\'umuco wacu."', transcript_english: '"During that time, our hills were very lush." "Our elders taught us that Inkomoko is the cornerstone of our culture."', play_count: 89, gratitude_count: 34, family_id: null, created_at: new Date('2024-07-10').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000007', title: "The River's Secret", description: 'Old wisdom regarding the cycles of the Great Lake.', author_id: elders[2].id, audio_url: null, text_content: null, category: 'story', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 765, era: null, cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 120, gratitude_count: 45, family_id: null, created_at: new Date('2024-07-15').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000008', title: 'Songs of Harvest', description: 'Rhythmic oral history of communal farming rituals.', author_id: elders[3].id, audio_url: null, text_content: null, category: 'song', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 500, era: null, cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 67, gratitude_count: 28, family_id: null, created_at: new Date('2024-08-01').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000009', title: 'The Lost Dialect', description: 'Preserving the terminology of the high mountain shepherds.', author_id: elders[4].id, audio_url: null, text_content: null, category: 'culture', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 1450, era: null, cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 234, gratitude_count: 89, family_id: null, created_at: new Date('2024-08-15').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000010', title: 'Proverbs of the Hearth', description: 'Thirty proverbs regarding family and fire.', author_id: elders[5].id, audio_url: null, text_content: null, category: 'proverb', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 355, era: null, cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 156, gratitude_count: 67, family_id: null, created_at: new Date('2024-09-01').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000011', title: "The Shepherd's Song", description: 'Hauntingly beautiful melodies of the high-altitude pastures.', author_id: elders[5].id, audio_url: null, text_content: null, category: 'song', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 480, era: '1974', cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 200, gratitude_count: 95, family_id: null, created_at: new Date('2024-09-10').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000016', title: "Umurage w'Ibisigo: The Verse of Our Ancestors", description: 'Ancestral poetry and verse from across Rwanda.', author_id: elders[5].id, audio_url: null, text_content: null, category: 'story', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 1200, era: null, cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 450, gratitude_count: 200, family_id: null, created_at: new Date('2024-10-01').toISOString(), updated_at: new Date().toISOString() },
    { id: 's1000000-0000-0000-0000-000000000018', title: 'The 1950 Migrations of the Eastern Province', description: 'An oral history of the great migrations.', author_id: elders[4].id, audio_url: null, text_content: null, category: 'story', language: 'kinyarwanda', visibility: 'public', status: 'published', duration_seconds: 1500, era: '1950', cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 2400, gratitude_count: 980, family_id: null, created_at: new Date('2024-10-15').toISOString(), updated_at: new Date().toISOString() },
    // Drafts
    { id: 's1000000-0000-0000-0000-000000000020', title: 'Umuganura 1974', description: null, author_id: elders[0].id, audio_url: null, text_content: null, category: 'story', language: 'kinyarwanda', visibility: 'public', status: 'draft', duration_seconds: 720, era: '1974', cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 0, gratitude_count: 0, family_id: null, created_at: new Date('2024-11-01').toISOString(), updated_at: new Date('2024-11-05').toISOString() },
    { id: 's1000000-0000-0000-0000-000000000021', title: 'Inama za Sogokuru', description: null, author_id: elders[0].id, audio_url: null, text_content: null, category: 'tradition', language: 'kinyarwanda', visibility: 'public', status: 'draft', duration_seconds: 330, era: null, cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 0, gratitude_count: 0, family_id: null, created_at: new Date('2024-11-10').toISOString(), updated_at: new Date('2024-11-12').toISOString() },
  ];

  // Family
  store.families = [
    { id: 'f1000000-0000-0000-0000-000000000001', name: 'Umuryango Wacu', code: 'INKOMOKO-AB12', description: 'The Gakuba family archive.', created_by: elders[0].id, created_at: new Date('2024-06-01').toISOString() }
  ];

  store.family_members = [
    { id: uuid(), family_id: store.families[0].id, user_id: elders[0].id, role: 'admin', status: 'approved', joined_at: new Date('2024-06-01').toISOString() },
    { id: uuid(), family_id: store.families[0].id, user_id: youth[0].id, role: 'youth', status: 'approved', joined_at: new Date('2024-06-10').toISOString() },
    { id: uuid(), family_id: store.families[0].id, user_id: elders[3].id, role: 'member', status: 'approved', joined_at: new Date('2024-06-15').toISOString() },
    { id: uuid(), family_id: store.families[0].id, user_id: elders[4].id, role: 'member', status: 'approved', joined_at: new Date('2024-07-01').toISOString() },
  ];

  store.followers = [
    { id: uuid(), follower_id: youth[0].id, followed_id: elders[0].id, created_at: new Date().toISOString() },
    { id: uuid(), follower_id: youth[0].id, followed_id: elders[2].id, created_at: new Date().toISOString() },
  ];

  store.comments = [
    { id: uuid(), story_id: store.stories[2].id, user_id: youth[0].id, content: 'Murakoze cyane Data! This story means so much to our family.', created_at: new Date('2024-07-01').toISOString() },
    { id: uuid(), story_id: store.stories[2].id, user_id: elders[3].id, content: 'Ndabikunda! My children must hear this.', created_at: new Date('2024-07-02').toISOString() },
  ];

  store.user_settings = [
    { id: uuid(), user_id: elders[0].id, daily_remembrances: true, family_tree_updates: true, listening_history_visible: true, family_tree_visible: true, updated_at: new Date().toISOString() },
    { id: uuid(), user_id: youth[0].id, daily_remembrances: true, family_tree_updates: false, listening_history_visible: true, family_tree_visible: true, updated_at: new Date().toISOString() },
    { id: uuid(), user_id: youth[1].id, daily_remembrances: true, family_tree_updates: false, listening_history_visible: true, family_tree_visible: true, updated_at: new Date().toISOString() },
  ];
}

// SQL-like query parser for the mock
function mockQuery(text, params = []) {
  // Replace $1, $2 etc with actual values for matching
  let sql = text.trim().toLowerCase();

  // Route to appropriate handler
  if (sql.startsWith('select')) return handleSelect(text, params);
  if (sql.startsWith('insert')) return handleInsert(text, params);
  if (sql.startsWith('update')) return handleUpdate(text, params);
  if (sql.startsWith('delete')) return handleDelete(text, params);

  return { rows: [], rowCount: 0 };
}

function handleSelect(sql, params) {
  const lower = sql.toLowerCase();

  // Users
  if (lower.includes('from users') && lower.includes('where') && lower.includes('email = $1') && !lower.includes('join')) {
    const rows = store.users.filter(u => u.email === params[0]);
    return { rows, rowCount: rows.length };
  }
  if (lower.includes('from users') && lower.includes('where') && lower.includes('phone = $1') && !lower.includes('join')) {
    const rows = store.users.filter(u => u.phone === params[0]);
    return { rows, rowCount: rows.length };
  }
  if (lower.includes('from users') && lower.includes('where') && lower.includes('id = $1') && !lower.includes('join') && !lower.includes('left join')) {
    const rows = store.users.filter(u => u.id === params[0]);
    return { rows: rows.map(u => ({ ...u })), rowCount: rows.length };
  }

  // User public profile with stats
  if (lower.includes('from users u') && lower.includes('left join stories') && lower.includes('left join followers') && lower.includes('where u.id = $1')) {
    const user = store.users.find(u => u.id === params[0]);
    if (!user) return { rows: [], rowCount: 0 };
    const storyCount = store.stories.filter(s => s.author_id === user.id && s.status === 'published').length;
    const totalPlays = store.stories.filter(s => s.author_id === user.id).reduce((sum, s) => sum + (s.play_count || 0), 0);
    const followerCount = store.followers.filter(f => f.followed_id === user.id).length;
    return { rows: [{ ...user, story_count: storyCount, total_plays: totalPlays, follower_count: followerCount }], rowCount: 1 };
  }

  // User settings
  if (lower.includes('from user_settings') && lower.includes('join users') && lower.includes('where') && lower.includes('user_id = $1')) {
    const setting = store.user_settings.find(s => s.user_id === params[0]);
    const user = store.users.find(u => u.id === params[0]);
    if (!setting || !user) return { rows: [], rowCount: 0 };
    return { rows: [{ ...setting, full_name: user.full_name, email: user.email, phone: user.phone, language_pref: user.language_pref }], rowCount: 1 };
  }

  // Stories list
  if (lower.includes('from stories s') && lower.includes('join users u') && lower.includes('order by s.created_at desc') && lower.includes('limit')) {
    let results = store.stories.filter(s => s.status === 'published');
    
    // Apply filters from params
    const paramIdx = { current: 1 };
    if (lower.includes('s.category =')) {
      const catParam = params[paramIdx.current]; paramIdx.current++;
      if (catParam) results = results.filter(s => s.category === catParam);
    }
    if (lower.includes('s.language =')) {
      const langParam = params[paramIdx.current]; paramIdx.current++;
      if (langParam) results = results.filter(s => s.language === langParam);
    }
    if (lower.includes('s.visibility =')) {
      const visParam = params[paramIdx.current]; paramIdx.current++;
      if (visParam) results = results.filter(s => s.visibility === visParam);
    }
    if (lower.includes('s.author_id =')) {
      const authParam = params[paramIdx.current]; paramIdx.current++;
      if (authParam) results = results.filter(s => s.author_id === authParam);
    }
    if (lower.includes('ilike')) {
      const searchParam = params[paramIdx.current]; paramIdx.current++;
      if (searchParam) {
        const term = searchParam.replace(/%/g, '').toLowerCase();
        results = results.filter(s => (s.title && s.title.toLowerCase().includes(term)) || (s.description && s.description.toLowerCase().includes(term)));
      }
    }

    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const limit = parseInt(params[params.length - 2]) || 20;
    const offset = parseInt(params[params.length - 1]) || 0;
    const sliced = results.slice(offset, offset + limit);

    const rows = sliced.map(s => {
      const author = store.users.find(u => u.id === s.author_id);
      return { ...s, author_name: author ? author.full_name : 'Unknown', author_avatar: author ? author.avatar_url : null, author_clan: author ? author.clan : null };
    });

    return { rows, rowCount: rows.length };
  }

  // Count stories
  if (lower.includes('select count(*)') && lower.includes('from stories')) {
    let results = store.stories.filter(s => s.status === 'published');
    if (params[1]) results = results.filter(s => s.category === params[1]);
    return { rows: [{ count: results.length.toString() }], rowCount: 1 };
  }

  // Trending
  if (lower.includes('from stories s') && lower.includes('order by s.play_count desc')) {
    const results = store.stories
      .filter(s => s.status === 'published' && s.visibility === 'public')
      .sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
      .slice(0, 10)
      .map(s => {
        const author = store.users.find(u => u.id === s.author_id);
        return { ...s, author_name: author ? author.full_name : 'Unknown', author_avatar: author ? author.avatar_url : null };
      });
    return { rows: results, rowCount: results.length };
  }

  // Drafts
  if (lower.includes('from stories') && lower.includes("status = 'draft'") && lower.includes('author_id = $1')) {
    const rows = store.stories.filter(s => s.author_id === params[0] && s.status === 'draft').sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    return { rows, rowCount: rows.length };
  }

  // My stories
  if (lower.includes('from stories') && lower.includes('author_id = $1') && lower.includes('order by created_at desc')) {
    const rows = store.stories.filter(s => s.author_id === params[0]).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows, rowCount: rows.length };
  }

  // Story detail
  if (lower.includes('from stories s') && lower.includes('join users u') && lower.includes('where s.id = $1') && !lower.includes('order by')) {
    const story = store.stories.find(s => s.id === params[0]);
    if (!story) return { rows: [], rowCount: 0 };
    const author = store.users.find(u => u.id === story.author_id);
    const authorStoryCount = store.stories.filter(s => s.author_id === story.author_id && s.status === 'published').length;
    return { rows: [{ ...story, author_name: author?.full_name, author_avatar: author?.avatar_url, author_bio: author?.bio, author_clan: author?.clan, author_age: author?.age, author_region: author?.region, author_province: author?.province, author_story_count: authorStoryCount }], rowCount: 1 };
  }

  // Bookmarks check
  if (lower.includes('from bookmarks') && lower.includes('user_id = $1') && lower.includes('story_id = $2')) {
    const rows = store.bookmarks.filter(b => b.user_id === params[0] && b.story_id === params[1]);
    return { rows, rowCount: rows.length };
  }

  // Gratitudes check
  if (lower.includes('from gratitudes') && lower.includes('user_id = $1') && lower.includes('story_id = $2')) {
    const rows = store.gratitudes.filter(g => g.user_id === params[0] && g.story_id === params[1]);
    return { rows, rowCount: rows.length };
  }

  // Comments for story
  if (lower.includes('from comments c') && lower.includes('join users u') && lower.includes('story_id = $1')) {
    const rows = store.comments
      .filter(c => c.story_id === params[0])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(c => {
        const user = store.users.find(u => u.id === c.user_id);
        return { ...c, author_name: user?.full_name, author_avatar: user?.avatar_url };
      });
    return { rows, rowCount: rows.length };
  }

  // Bookmarked stories
  if (lower.includes('from stories s') && lower.includes('join bookmarks b')) {
    const userBookmarks = store.bookmarks.filter(b => b.user_id === params[0]);
    const rows = userBookmarks.map(bk => {
      const s = store.stories.find(st => st.id === bk.story_id);
      const author = store.users.find(u => u.id === s?.author_id);
      return s ? { ...s, author_name: author?.full_name, author_avatar: author?.avatar_url } : null;
    }).filter(Boolean);
    return { rows, rowCount: rows.length };
  }

  // Feed stories
  if (lower.includes('from stories s') && lower.includes("s.visibility = 'public'") && lower.includes('from family_members')) {
    const stories = store.stories
      .filter(s => s.status === 'published' && s.visibility === 'public')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20)
      .map(s => {
        const author = store.users.find(u => u.id === s.author_id);
        return { ...s, author_name: author?.full_name, author_avatar: author?.avatar_url };
      });
    return { rows: stories, rowCount: stories.length };
  }

  // Families
  if (lower.includes('from families f') && lower.includes('join family_members fm') && lower.includes('fm.user_id = $1')) {
    const memberFamilies = store.family_members.filter(fm => fm.user_id === params[0] && fm.status === 'approved');
    const rows = memberFamilies.map(fm => {
      const fam = store.families.find(f => f.id === fm.family_id);
      const memberCount = store.family_members.filter(m => m.family_id === fm.family_id && m.status === 'approved').length;
      return fam ? { ...fam, my_role: fm.role, my_status: fm.status, member_count: memberCount } : null;
    }).filter(Boolean);
    return { rows, rowCount: rows.length };
  }

  // Family by code
  if (lower.includes('from families') && lower.includes('code = $1')) {
    const rows = store.families.filter(f => f.code === params[0]);
    return { rows, rowCount: rows.length };
  }

  // Family members
  if (lower.includes('from family_members fm') && lower.includes('join users u') && lower.includes('fm.family_id = $1') && !lower.includes("fm.status = 'pending'") && !lower.includes("u.role = 'elder'")) {
    const members = store.family_members.filter(fm => fm.family_id === params[0]);
    const rows = members.map(fm => {
      const user = store.users.find(u => u.id === fm.user_id);
      return user ? { ...fm, full_name: user.full_name, avatar_url: user.avatar_url, user_role: user.role, email: user.email } : null;
    }).filter(Boolean).sort((a, b) => (a.role === 'admin' ? -1 : 1));
    return { rows, rowCount: rows.length };
  }

  // Pending members
  if (lower.includes('from family_members fm') && lower.includes("fm.status = 'pending'")) {
    const members = store.family_members.filter(fm => fm.family_id === params[0] && fm.status === 'pending');
    const rows = members.map(fm => {
      const user = store.users.find(u => u.id === fm.user_id);
      return user ? { ...fm, full_name: user.full_name, avatar_url: user.avatar_url, user_role: user.role } : null;
    }).filter(Boolean);
    return { rows, rowCount: rows.length };
  }

  // Family member check (admin)
  if (lower.includes('from family_members') && lower.includes("role = 'admin'") && lower.includes("status = 'approved'")) {
    const rows = store.family_members.filter(fm => fm.family_id === params[0] && fm.user_id === params[1] && fm.role === 'admin' && fm.status === 'approved');
    return { rows, rowCount: rows.length };
  }

  // Family member check (any)
  if (lower.includes('from family_members') && lower.includes('family_id = $1') && lower.includes('user_id = $2') && !lower.includes('role')) {
    const rows = store.family_members.filter(fm => fm.family_id === params[0] && fm.user_id === params[1]);
    return { rows, rowCount: rows.length };
  }

  // Family elders
  if (lower.includes('from users u') && lower.includes('join family_members fm') && lower.includes("u.role = 'elder'")) {
    const members = store.family_members.filter(fm => fm.family_id === params[0] && fm.status === 'approved');
    const rows = members.map(fm => {
      const user = store.users.find(u => u.id === fm.user_id && u.role === 'elder');
      if (!user) return null;
      const storyCount = store.stories.filter(s => s.author_id === user.id && s.status === 'published').length;
      return { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url, bio: user.bio, story_count: storyCount };
    }).filter(Boolean);
    return { rows, rowCount: rows.length };
  }

  // Library featured
  if (lower.includes('from stories s') && lower.includes('order by s.gratitude_count desc') && lower.includes('limit 1')) {
    const story = [...store.stories].filter(s => s.status === 'published' && s.visibility === 'public').sort((a, b) => (b.gratitude_count || 0) - (a.gratitude_count || 0))[0];
    if (!story) return { rows: [], rowCount: 0 };
    const author = store.users.find(u => u.id === story.author_id);
    return { rows: [{ ...story, author_name: author?.full_name, author_avatar: author?.avatar_url }], rowCount: 1 };
  }

  // Library near me
  if (lower.includes('u.region = $1') && lower.includes('limit 6')) {
    const stories = store.stories.filter(s => s.status === 'published' && s.visibility === 'public').slice(0, 6);
    const rows = stories.map(s => {
      const author = store.users.find(u => u.id === s.author_id);
      return { ...s, author_name: author?.full_name, author_avatar: author?.avatar_url, author_region: author?.region };
    });
    return { rows, rowCount: rows.length };
  }

  // Library archive
  if (lower.includes('order by s.gratitude_count desc') && lower.includes('limit 12')) {
    const stories = [...store.stories].filter(s => s.status === 'published' && s.visibility === 'public').sort((a, b) => (b.gratitude_count || 0) - (a.gratitude_count || 0)).slice(0, 12);
    const rows = stories.map(s => {
      const author = store.users.find(u => u.id === s.author_id);
      return { ...s, author_name: author?.full_name, author_avatar: author?.avatar_url };
    });
    return { rows, rowCount: rows.length };
  }

  // Categories count
  if (lower.includes('select category, count(*)') && lower.includes('group by category')) {
    const cats = {};
    store.stories.filter(s => s.status === 'published' && s.visibility === 'public').forEach(s => { cats[s.category] = (cats[s.category] || 0) + 1; });
    const rows = Object.entries(cats).map(([category, count]) => ({ category, count: count.toString() })).sort((a, b) => parseInt(b.count) - parseInt(a.count));
    return { rows, rowCount: rows.length };
  }

  // Stats
  if (lower.includes("select count(*)") && lower.includes("from stories") && lower.includes("status = 'published'") && !lower.includes('author_id')) {
    return { rows: [{ count: store.stories.filter(s => s.status === 'published').length.toString() }] };
  }
  if (lower.includes("select count(*)") && lower.includes("from users") && lower.includes("role = 'elder'")) {
    return { rows: [{ count: store.users.filter(u => u.role === 'elder').length.toString() }] };
  }
  if (lower.includes("select coalesce(sum(play_count), 0)") && lower.includes("from stories") && !lower.includes('author_id')) {
    const total = store.stories.reduce((sum, s) => sum + (s.play_count || 0), 0);
    return { rows: [{ total: total.toString() }] };
  }

  // Dashboard elder stats
  if (lower.includes("select count(*)") && lower.includes("from stories") && lower.includes('author_id = $1') && lower.includes("status = 'published'")) {
    return { rows: [{ count: store.stories.filter(s => s.author_id === params[0] && s.status === 'published').length.toString() }] };
  }
  if (lower.includes('select count(distinct ph.user_id)') && lower.includes('from play_history')) {
    return { rows: [{ count: '0' }] };
  }
  if (lower.includes("select coalesce(sum(play_count), 0)") && lower.includes('author_id = $1')) {
    const total = store.stories.filter(s => s.author_id === params[0]).reduce((sum, s) => sum + (s.play_count || 0), 0);
    return { rows: [{ total: total.toString() }] };
  }

  // Followers check
  if (lower.includes('from followers') && lower.includes('follower_id = $1') && lower.includes('followed_id = $2')) {
    const rows = store.followers.filter(f => f.follower_id === params[0] && f.followed_id === params[1]);
    return { rows, rowCount: rows.length };
  }

  return { rows: [], rowCount: 0 };
}

function handleInsert(sql, params) {
  const lower = sql.toLowerCase();

  if (lower.includes('into users')) {
    const user = { id: uuid(), full_name: params[0], email: params[1], phone: params[2], password_hash: params[3], role: params[4] || 'youth', avatar_url: null, region: null, province: null, language_pref: 'kinyarwanda', cultural_background: [], voice_intro_url: null, interests: [], bio: null, clan: null, age: null, is_onboarded: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    store.users.push(user);
    return { rows: [{ ...user }], rowCount: 1 };
  }

  if (lower.includes('into user_settings')) {
    const setting = { id: uuid(), user_id: params[0], daily_remembrances: true, family_tree_updates: false, listening_history_visible: true, family_tree_visible: true, updated_at: new Date().toISOString() };
    store.user_settings.push(setting);
    return { rows: [setting], rowCount: 1 };
  }

  if (lower.includes('into stories')) {
    const story = { id: uuid(), title: params[0], description: params[1], text_content: params[2], author_id: params[3], category: params[4] || 'story', language: params[5] || 'kinyarwanda', visibility: params[6] || 'public', status: params[7] || 'draft', era: params[8] || null, audio_url: null, cover_image_url: null, transcript_kinyarwanda: null, transcript_english: null, play_count: 0, gratitude_count: 0, duration_seconds: 0, family_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    store.stories.push(story);
    return { rows: [{ ...story }], rowCount: 1 };
  }

  if (lower.includes('into families')) {
    const family = { id: uuid(), name: params[0], code: params[1], description: params[2], created_by: params[3], created_at: new Date().toISOString() };
    store.families.push(family);
    return { rows: [family], rowCount: 1 };
  }

  if (lower.includes('into family_members')) {
    const fm = { id: uuid(), family_id: params[0], user_id: params[1], role: lower.includes("'admin'") ? 'admin' : lower.includes("'member'") ? 'member' : 'youth', status: lower.includes("'approved'") ? 'approved' : 'pending', joined_at: new Date().toISOString() };
    store.family_members.push(fm);
    return { rows: [fm], rowCount: 1 };
  }

  if (lower.includes('into gratitudes')) {
    const g = { id: uuid(), user_id: params[0], story_id: params[1], created_at: new Date().toISOString() };
    store.gratitudes.push(g);
    return { rows: [g], rowCount: 1 };
  }

  if (lower.includes('into bookmarks')) {
    const b = { id: uuid(), user_id: params[0], story_id: params[1], created_at: new Date().toISOString() };
    store.bookmarks.push(b);
    return { rows: [b], rowCount: 1 };
  }

  if (lower.includes('into followers')) {
    const f = { id: uuid(), follower_id: params[0], followed_id: params[1], created_at: new Date().toISOString() };
    store.followers.push(f);
    return { rows: [f], rowCount: 1 };
  }

  if (lower.includes('into comments')) {
    const c = { id: uuid(), story_id: params[0], user_id: params[1], content: params[2], created_at: new Date().toISOString() };
    store.comments.push(c);
    return { rows: [c], rowCount: 1 };
  }

  if (lower.includes('into play_history')) {
    return { rows: [{}], rowCount: 1 };
  }

  if (lower.includes('into story_tags')) {
    return { rows: [{}], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

function handleUpdate(sql, params) {
  const lower = sql.toLowerCase();

  if (lower.includes('update users set') && lower.includes('is_onboarded = true')) {
    const userId = params[params.length - 1];
    const user = store.users.find(u => u.id === userId);
    if (user) {
      if (params[0]) user.full_name = params[0];
      if (params[1]) user.role = params[1];
      if (params[2]) user.region = params[2];
      if (params[3]) user.province = params[3];
      if (params[4]) user.language_pref = params[4];
      if (params[5]) user.cultural_background = params[5];
      if (params[6]) user.interests = params[6];
      user.is_onboarded = true;
      user.updated_at = new Date().toISOString();
      return { rows: [{ ...user }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (lower.includes('update users set') && lower.includes('where id = $')) {
    const userId = params[params.length - 1];
    const user = store.users.find(u => u.id === userId);
    if (user) {
      if (params[0] !== undefined && params[0] !== null) user.full_name = params[0];
      user.updated_at = new Date().toISOString();
      return { rows: [{ ...user }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (lower.includes('update users set') && lower.includes('language_pref = $1')) {
    const user = store.users.find(u => u.id === params[1]);
    if (user) user.language_pref = params[0];
    return { rows: [], rowCount: user ? 1 : 0 };
  }

  if (lower.includes('update user_settings')) {
    const userId = params[params.length - 1];
    const setting = store.user_settings.find(s => s.user_id === userId);
    if (setting) {
      if (params[0] !== undefined && params[0] !== null) setting.daily_remembrances = params[0];
      if (params[1] !== undefined && params[1] !== null) setting.family_tree_updates = params[1];
      if (params[2] !== undefined && params[2] !== null) setting.listening_history_visible = params[2];
      if (params[3] !== undefined && params[3] !== null) setting.family_tree_visible = params[3];
      setting.updated_at = new Date().toISOString();
      return { rows: [{ ...setting }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (lower.includes('update stories set') && lower.includes('play_count = play_count + 1')) {
    const story = store.stories.find(s => s.id === params[0]);
    if (story) story.play_count = (story.play_count || 0) + 1;
    return { rows: [], rowCount: 1 };
  }

  if (lower.includes('update stories set') && lower.includes('gratitude_count = gratitude_count + 1')) {
    const story = store.stories.find(s => s.id === params[0]);
    if (story) story.gratitude_count = (story.gratitude_count || 0) + 1;
    return { rows: [], rowCount: 1 };
  }

  if (lower.includes('update stories set') && lower.includes('gratitude_count = greatest')) {
    const story = store.stories.find(s => s.id === params[0]);
    if (story) story.gratitude_count = Math.max(0, (story.gratitude_count || 0) - 1);
    return { rows: [], rowCount: 1 };
  }

  if (lower.includes('update stories set') && lower.includes('audio_url = $1')) {
    const story = store.stories.find(s => s.id === params[2] && s.author_id === params[3]);
    if (story) { story.audio_url = params[0]; story.duration_seconds = params[1] || 0; return { rows: [{ ...story }], rowCount: 1 }; }
    return { rows: [], rowCount: 0 };
  }

  if (lower.includes('update stories set') && (lower.includes('title = coalesce') || lower.includes('where id = $'))) {
    const storyIdx = lower.includes('author_id = $12') ? 10 : params.length - 2;
    const authorIdx = params.length - 1;
    const story = store.stories.find(s => s.id === params[storyIdx] && s.author_id === params[authorIdx]);
    if (story) {
      if (params[0]) story.title = params[0];
      if (params[1]) story.description = params[1];
      if (params[6]) story.status = params[6];
      story.updated_at = new Date().toISOString();
      return { rows: [{ ...story }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (lower.includes('update family_members set') && lower.includes("status = 'approved'")) {
    const fm = store.family_members.find(m => m.id === params[0] && m.family_id === params[1]);
    if (fm) fm.status = 'approved';
    return { rows: [], rowCount: 1 };
  }

  if (lower.includes('update family_members set') && lower.includes('role = coalesce')) {
    const fm = store.family_members.find(m => m.id === params[2] && m.family_id === params[3]);
    if (fm) {
      if (params[0]) fm.role = params[0];
      if (params[1]) fm.status = params[1];
      return { rows: [{ ...fm }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  return { rows: [], rowCount: 0 };
}

function handleDelete(sql, params) {
  const lower = sql.toLowerCase();

  if (lower.includes('from stories') && lower.includes('id = $1') && lower.includes('author_id = $2')) {
    const idx = store.stories.findIndex(s => s.id === params[0] && s.author_id === params[1]);
    if (idx !== -1) { store.stories.splice(idx, 1); return { rows: [{ id: params[0] }], rowCount: 1 }; }
    return { rows: [], rowCount: 0 };
  }

  if (lower.includes('from gratitudes')) {
    const idx = store.gratitudes.findIndex(g => g.user_id === params[0] && g.story_id === params[1]);
    if (idx !== -1) store.gratitudes.splice(idx, 1);
    return { rows: [], rowCount: 1 };
  }

  if (lower.includes('from bookmarks')) {
    const idx = store.bookmarks.findIndex(b => b.user_id === params[0] && b.story_id === params[1]);
    if (idx !== -1) store.bookmarks.splice(idx, 1);
    return { rows: [], rowCount: 1 };
  }

  if (lower.includes('from followers')) {
    const idx = store.followers.findIndex(f => f.follower_id === params[0] && f.followed_id === params[1]);
    if (idx !== -1) store.followers.splice(idx, 1);
    return { rows: [], rowCount: 1 };
  }

  if (lower.includes('from family_members')) {
    const idx = store.family_members.findIndex(fm => fm.id === params[0] && fm.family_id === params[1]);
    if (idx !== -1) store.family_members.splice(idx, 1);
    return { rows: [], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

// Initialize seed data
let initialized = false;

module.exports = {
  async query(text, params) {
    if (!initialized) { await seedData(); initialized = true; }
    return mockQuery(text, params);
  },
  getClient: () => Promise.resolve({ query: mockQuery, release: () => {} }),
  pool: { on: () => {} },
};

-- ============================================================
-- Inkomoko — Seed Data
-- ============================================================

-- Password: 'inkomoko123' hashed with bcrypt
-- $2b$10$placeholder — will be generated at runtime

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (id, full_name, email, phone, role, region, province, language_pref, cultural_background, bio, clan, age, is_onboarded, avatar_url) VALUES
-- Elders
('a1000000-0000-0000-0000-000000000001', 'Gakwaya', 'gakwaya@inkomoko.rw', '+250788000001', 'elder', 'Northern Province', 'Musanze', 'kinyarwanda', ARRAY['Umuco w''u Rwanda', 'Abagabo'], 'A storyteller and keeper of oral traditions from the hills of Musanze.', 'Abanyiginya', 78, true, '/uploads/avatars/gakwaya.jpg'),
('a1000000-0000-0000-0000-000000000002', 'Mzee Karekezi', 'karekezi@inkomoko.rw', '+250788000002', 'elder', 'Southern Province', 'Nyanza', 'kinyarwanda', ARRAY['Umuco w''u Rwanda'], 'Keeper of 12 Traditions, master of the weaving arts.', 'Abega', 82, true, '/uploads/avatars/karekezi.jpg'),
('a1000000-0000-0000-0000-000000000003', 'Mzee Kanyamahanga', 'kanyamahanga@inkomoko.rw', '+250788000003', 'elder', 'Southern Province', 'Nyanza', 'kinyarwanda', ARRAY['Umuco w''u Rwanda', 'Inyambo'], 'Master storyteller and keeper of the oral traditions of the Nyanza royal court.', 'Abanyiginya', 84, true, '/uploads/avatars/kanyamahanga.jpg'),
('a1000000-0000-0000-0000-000000000004', 'Nyirahirwa', 'nyirahirwa@inkomoko.rw', '+250788000004', 'elder', 'Eastern Province', 'Kayonza', 'kinyarwanda', ARRAY['Umuco w''u Rwanda'], 'Grandmother and keeper of recipes and songs.', 'Abagesera', 74, true, '/uploads/avatars/nyirahirwa.jpg'),
('a1000000-0000-0000-0000-000000000005', 'Munyana', 'munyana@inkomoko.rw', '+250788000005', 'elder', 'Western Province', 'Rubavu', 'kinyarwanda', ARRAY['Umuco w''u Rwanda'], 'Great uncle, teller of cattle and kings.', 'Abanyiginya', 80, true, '/uploads/avatars/munyana.jpg'),
('a1000000-0000-0000-0000-000000000006', 'Mzee Mutabazi', 'mutabazi@inkomoko.rw', '+250788000006', 'elder', 'Southern Province', 'Nyanza', 'kinyarwanda', ARRAY['Umuco w''u Rwanda'], 'Chronicler of the nomadic cattle herding cycles.', 'Abega', 76, true, '/uploads/avatars/mutabazi.jpg'),

-- Youth
('b1000000-0000-0000-0000-000000000001', 'Keza', 'keza@inkomoko.rw', '+250788100001', 'youth', 'Kigali', 'Kigali', 'english', ARRAY[]::TEXT[], 'Young listener passionate about preserving family stories.', NULL, 22, true, '/uploads/avatars/keza.jpg'),
('b1000000-0000-0000-0000-000000000002', 'Balthazar Mugisha', 'b.mugisha@livingarchive.rw', '+250788100002', 'youth', 'Kigali', 'Kigali', 'english', ARRAY[]::TEXT[], NULL, NULL, 28, true, '/uploads/avatars/mugisha.jpg');

-- ============================================================
-- FAMILIES
-- ============================================================
INSERT INTO families (id, name, code, description, created_by) VALUES
('f1000000-0000-0000-0000-000000000001', 'Umuryango Wacu', 'INKOMOKO-AB12', 'The Gakuba family archive — preserving our roots.', 'a1000000-0000-0000-0000-000000000001');

-- ============================================================
-- FAMILY MEMBERS
-- ============================================================
INSERT INTO family_members (family_id, user_id, role, status) VALUES
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'admin', 'approved'),
('f1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'youth', 'approved'),
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'member', 'approved'),
('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'member', 'approved');

-- ============================================================
-- STORIES
-- ============================================================
INSERT INTO stories (id, title, description, author_id, category, language, visibility, status, duration_seconds, era, play_count, gratitude_count, transcript_kinyarwanda, transcript_english, cover_image_url) VALUES
-- Published stories
('s1000000-0000-0000-0000-000000000001', 'Ubutwari bwa Data mu gihe cy''isarura', 'The bravery of our father during the harvest season — a story of perseverance and communal strength.', 'a1000000-0000-0000-0000-000000000001', 'story', 'kinyarwanda', 'public', 'published', 924, '1974', 42, 15,
    '"Muri icyo gihe, imisozi yacu yari itoshye cyane. Inka zabaga zifite ibyatsi bihagije, kandi amazi yatemba mu mibande yari afutuye."',
    '"During that time, our hills were very lush. The cattle had plenty of grass, and the water flowing in the valleys was crystal clear."',
    '/uploads/covers/harvest.jpg'),

('s1000000-0000-0000-0000-000000000002', 'Imigenzo y''Inka n''Amata: Icyo bisobanura ku banyarwanda', 'The customs of cattle and milk, and their deep meaning in Rwandan culture.', 'a1000000-0000-0000-0000-000000000001', 'tradition', 'kinyarwanda', 'public', 'published', 720, '1960', 38, 12,
    '"Nari nkiri muto ubwo sogokuru yanyigishaga uburyo amata yubaha umuryango. Izi ni inama nifuza ko abuzukuru banjye bazazirikana..."',
    '"I was still young when my grandfather taught me how milk honors the family. These are the lessons I wish my grandchildren will remember..."',
    NULL),

('s1000000-0000-0000-0000-000000000003', 'Izina ryawe rifite intego: Inkuru y''amazina yacu', 'Your name has a purpose: the story behind our family names.', 'a1000000-0000-0000-0000-000000000001', 'culture', 'kinyarwanda', 'family', 'published', 330, NULL, 18, 8, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000004', 'The Hill of Whispers', 'Ancient tales of the whispering hills told by the village elders.', 'a1000000-0000-0000-0000-000000000001', 'story', 'kinyarwanda', 'public', 'published', 252, NULL, 24, 6, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000005', 'The Cattle and the Kings', 'How cattle shaped the destiny of Rwandan kingdoms.', 'a1000000-0000-0000-0000-000000000005', 'story', 'kinyarwanda', 'public', 'published', 765, '1940', 56, 22, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000006', 'The Weaving of Inkomoko', 'The deep cultural significance of weaving in Rwandan heritage.', 'a1000000-0000-0000-0000-000000000002', 'tradition', 'kinyarwanda', 'public', 'published', 924, 'June 1952', 89, 34,
    '"Muri icyo gihe, imisozi yacu yari itoshye cyane. Inka zabaga zifite ibyatsi bihagije, kandi amazi yatemba mu mibande yari afutuye." "Abasaza bacu batwigishaga ko Inkomoko ari yo nkingi ya mwamba y''umuco wacu. Nta kintu cyakorwaga hatabayeho gusangira no gushimira." "Buri gitondo, izuba rirashe, twahuriraga munsi y''igiti cy''umuvumu tukaganira ku mateka y''abasogokuruza bacu."',
    '"During that time, our hills were very lush. The cattle had plenty of grass, and the water flowing in the valleys was crystal clear." "Our elders taught us that Inkomoko is the cornerstone of our culture. Nothing was done without sharing and giving thanks." "Every morning, at sunrise, we would meet under the Ficus tree to discuss the history of our ancestors."',
    NULL),

('s1000000-0000-0000-0000-000000000007', 'The River''s Secret', 'Old wisdom regarding the cycles of the Great Lake and the ancestral migration patterns.', 'a1000000-0000-0000-0000-000000000003', 'story', 'kinyarwanda', 'public', 'published', 765, NULL, 120, 45, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000008', 'Songs of Harvest', 'A rhythmic oral history of communal farming rituals and the songs that made the work lighter.', 'a1000000-0000-0000-0000-000000000004', 'song', 'kinyarwanda', 'public', 'published', 500, NULL, 67, 28, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000009', 'The Lost Dialect', 'Preserving the specific terminology of the high mountain shepherds.', 'a1000000-0000-0000-0000-000000000005', 'culture', 'kinyarwanda', 'public', 'published', 1450, NULL, 234, 89, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000010', 'Proverbs of the Hearth', 'A collection of thirty proverbs regarding family and fire, narrated by Chief Mutara.', 'a1000000-0000-0000-0000-000000000006', 'proverb', 'kinyarwanda', 'public', 'published', 355, NULL, 156, 67, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000011', 'The Shepherd''s Song', 'Hauntingly beautiful melodies of the high-altitude pastures, recorded by Elder Mutara in 1974.', 'a1000000-0000-0000-0000-000000000006', 'song', 'kinyarwanda', 'public', 'published', 480, '1974', 200, 95, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000012', 'The Legend of the Twin Lakes', 'The secrets of Burera and Ruhondo as told by the fishing families.', 'a1000000-0000-0000-0000-000000000001', 'tradition', 'kinyarwanda', 'public', 'published', 720, NULL, 45, 18, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000013', 'The Pattern of Peace', 'Decoding the geometric language woven into our Agaseke baskets.', 'a1000000-0000-0000-0000-000000000002', 'culture', 'kinyarwanda', 'public', 'published', 480, NULL, 32, 14, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000014', 'The Ritual of the Royal Inyambo', 'Detailed account of the ceremonial training and grooming of the kings'' cattle.', 'a1000000-0000-0000-0000-000000000003', 'story', 'kinyarwanda', 'public', 'published', 1080, '1940', 312, 145, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000015', 'The Language of Bells', 'How herdsmen communicated through whistle patterns and cattle bell frequencies.', 'a1000000-0000-0000-0000-000000000003', 'culture', 'kinyarwanda', 'public', 'published', 600, NULL, 78, 33, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000016', 'Umurage w''Ibisigo: The Verse of Our Ancestors', 'A curated collection of ancestral poetry and verse from across Rwanda.', 'a1000000-0000-0000-0000-000000000006', 'story', 'kinyarwanda', 'public', 'published', 1200, NULL, 450, 200, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000017', 'Mzee Mutabazi: The Cattle Keeper''s Song', 'A chronicle of the nomadic cycles of the kings'' cattle herds.', 'a1000000-0000-0000-0000-000000000006', 'song', 'kinyarwanda', 'public', 'published', 900, NULL, 189, 78, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000018', 'The 1950 Migrations of the Eastern Province', 'An oral history of the great migrations that shaped eastern Rwanda.', 'a1000000-0000-0000-0000-000000000005', 'story', 'kinyarwanda', 'public', 'published', 1500, '1950', 2400, 980, NULL, NULL, NULL),

('s1000000-0000-0000-0000-000000000019', 'Nyangezi''s Lament: A Poem of the Lake', 'Poetic folklore from the lakes of western Rwanda.', 'a1000000-0000-0000-0000-000000000004', 'song', 'kinyarwanda', 'public', 'published', 420, NULL, 890, 340, NULL, NULL, NULL),

-- Draft stories
('s1000000-0000-0000-0000-000000000020', 'Umuganura 1974', NULL, 'a1000000-0000-0000-0000-000000000001', 'story', 'kinyarwanda', 'public', 'draft', 720, '1974', 0, 0, NULL, NULL, NULL),
('s1000000-0000-0000-0000-000000000021', 'Inama za Sogokuru', NULL, 'a1000000-0000-0000-0000-000000000001', 'tradition', 'kinyarwanda', 'public', 'draft', 330, NULL, 0, 0, NULL, NULL, NULL),
('s1000000-0000-0000-0000-000000000022', 'Uruka rwa Kera', NULL, 'a1000000-0000-0000-0000-000000000001', 'culture', 'kinyarwanda', 'public', 'draft', 0, NULL, 0, 0, NULL, NULL, NULL);

-- ============================================================
-- BOOKMARKS
-- ============================================================
INSERT INTO bookmarks (user_id, story_id) VALUES
('b1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000005');

-- ============================================================
-- FOLLOWERS
-- ============================================================
INSERT INTO followers (follower_id, followed_id) VALUES
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003');

-- ============================================================
-- COMMENTS
-- ============================================================
INSERT INTO comments (story_id, user_id, content) VALUES
('s1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Murakoze cyane Data! This story means so much to our family.'),
('s1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Ndabikunda! My children must hear this.'),
('s1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Can you tell us more about the naming ceremony?');

-- ============================================================
-- USER SETTINGS
-- ============================================================
INSERT INTO user_settings (user_id, daily_remembrances, family_tree_updates, listening_history_visible, family_tree_visible) VALUES
('b1000000-0000-0000-0000-000000000002', true, false, true, true),
('a1000000-0000-0000-0000-000000000001', true, true, true, true);

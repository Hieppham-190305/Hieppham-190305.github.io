'use strict';

var Experience = (function () {
    var intro = document.getElementById('intro'), card = document.getElementById('final-card'),
        actions = document.getElementById('cake-actions'), musicButton = document.getElementById('music'),
        announcement = document.getElementById('announcement'), timer, scene = 'intro',
        memories = document.getElementById('memories'), wish = document.getElementById('wish-sky'),
        letter = document.getElementById('personal-letter'), content = window.BirthdayContent,
        memoryIndex = 0, memoryTimer, secretTimer, imageUrl;
    var messages = 'Chúc mừng|Sinh nhật|Phan Võ Minh Thư|#countdown 3|Chúc Thư|Luôn vui vẻ|Tài sắc vẹn toàn|và|Sớm có bằng lái|nhaaaa|#memories';
    document.getElementById('letter-message').textContent = content.letter;
    document.getElementById('letter-signature').textContent = content.signature;

    // A quiet music-box melody generated locally after the opening tap.
    var audio, master, noteTimer, voice, musicOn = false, noteIndex = 0;
    var melody = [[60,.5],[60,.5],[62,1],[60,1],[65,1],[64,2],[60,.5],[60,.5],[62,1],[60,1],[67,1],[65,2],
        [60,.5],[60,.5],[72,1],[69,1],[65,1],[64,1],[62,2],[70,.5],[70,.5],[69,1],[65,1],[67,1],[65,2]];
    function playNote() {
        if (!musicOn || document.hidden) { return; }
        var note = melody[noteIndex++ % melody.length], duration = note[1] * .42;
        voice = audio.createOscillator();
        var envelope = audio.createGain(), now = audio.currentTime;
        voice.type = 'sine';
        voice.frequency.value = 440 * Math.pow(2, (note[0] - 69) / 12);
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(.2, now + .015);
        envelope.gain.exponentialRampToValueAtTime(.001, now + duration * .95);
        voice.connect(envelope); envelope.connect(master);
        voice.start(now); voice.stop(now + duration);
        voice.onended = function () { this.disconnect(); envelope.disconnect(); };
        noteTimer = setTimeout(playNote, duration * 1000 + (noteIndex % melody.length === 0 ? 1500 : 0));
    }
    function updateMusicButton() {
        musicButton.textContent = musicOn ? '♪ Nhạc: bật' : '♪ Nhạc: tắt';
        musicButton.setAttribute('aria-pressed', String(musicOn));
    }
    function toggleMusic() {
        if (musicOn) {
            musicOn = false; clearTimeout(noteTimer);
            if (master) { master.gain.value = 0; }
            updateMusicButton(); return;
        }
        try {
            var Audio = window.AudioContext || window.webkitAudioContext;
            if (!Audio) { musicButton.hidden = true; return; }
            if (!audio) { audio = new Audio(); master = audio.createGain(); master.connect(audio.destination); }
            musicOn = true; master.gain.value = .3; updateMusicButton();
            audio.resume().then(function () { if (musicOn) { playNote(); } }).catch(function () {
                musicOn = false; updateMusicButton();
            });
        } catch (error) { musicOn = false; updateMusicButton(); }
    }

    function celebrate() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
        var canvas = document.getElementById('confetti'), c = canvas.getContext('2d'),
            width = window.innerWidth, height = window.innerHeight, ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * ratio; canvas.height = height * ratio; c.setTransform(ratio, 0, 0, ratio, 0, 0);
        var pieces = Array.from({length: width < 768 ? 85 : 130}, function () {
            return { x: width / 2, y: height * .52, vx: (Math.random() - .5) * 12,
                vy: -4 - Math.random() * 9, angle: Math.random() * 6,
                color: ['#f6dda1','#e8a676','#fff0d4','#bb8663'][Math.floor(Math.random() * 4)] };
        }), start, last;
        function frame(now) {
            if (!start) { start = now; last = now; }
            var step = Math.min((now - last) / 16.67, 2); last = now;
            c.clearRect(0, 0, width, height);
            c.globalAlpha = Math.max(0, 1 - (now - start) / 4200);
            pieces.forEach(function (p) {
                p.x += p.vx * step; p.y += p.vy * step; p.vy += .14 * step; p.angle += .06 * step;
                c.save(); c.translate(p.x, p.y); c.rotate(p.angle); c.fillStyle = p.color;
                c.fillRect(-3, -5, 6, 10); c.restore();
            });
            if (now - start < 4200) { requestAnimationFrame(frame); } else { c.clearRect(0, 0, width, height); }
        }
        requestAnimationFrame(frame);
    }

    function start() {
        clearTimeout(timer); clearTimeout(memoryTimer); clearTimeout(secretTimer);
        memories.hidden = true; wish.hidden = true; letter.hidden = true;
        document.getElementById('secret-message').hidden = true;
        document.getElementById('open-letter').setAttribute('aria-expanded', 'false');
        scene = 'messages'; document.body.dataset.scene = scene;
        intro.hidden = true; card.hidden = true; actions.hidden = true; musicButton.hidden = false;
        announcement.textContent = 'Những lời chúc sinh nhật dành cho Thư.';
        S.UI.simulate(messages);
        musicButton.focus({preventScroll: true});
    }
    function showMemory() {
        clearTimeout(memoryTimer);
        var item = content.memories[memoryIndex], image = document.getElementById('memory-image');
        image.src = item.image; image.alt = item.caption; image.style.objectPosition = item.position || 'center';
        document.getElementById('memory-caption').textContent = item.caption;
        document.getElementById('memory-count').textContent = (memoryIndex + 1) + ' / ' + content.memories.length;
        document.getElementById('memory-prev').disabled = memoryIndex === 0;
        // Each photo gets its own reading time; manual navigation restarts this timer.
        memoryTimer = setTimeout(function () {
            if (document.hidden) { showMemory(); return; }
            if (memoryIndex < content.memories.length - 1) { memoryIndex++; showMemory(); }
            else { finishMemories(); }
        }, 4200);
    }
    function showMemories() {
        scene = 'memories'; document.body.dataset.scene = scene;
        if (!content.memories.length) { finishMemories(); return; }
        memoryIndex = 0; memories.hidden = false; showMemory();
        announcement.textContent = 'Một chút kỷ niệm trước khi ước một điều.';
        document.getElementById('memories-title').focus({preventScroll: true});
    }
    function finishMemories() {
        if (scene !== 'memories') { return; }
        clearTimeout(memoryTimer); memories.hidden = true;
        S.Shape.switchShape(S.ShapeBuilder.cake(true), true, true);
        showCake();
    }
    function showCake() {
        scene = 'cake'; document.body.dataset.scene = scene;
        timer = setTimeout(function () {
            actions.hidden = false;
            // Reserve room below the cake for the wish prompt on short screens.
            S.ShapeBuilder.refresh();
            announcement.textContent = 'Ước một điều rồi chạm vào nút để tắt nến nhé.';
            document.getElementById('blow-candles').focus({preventScroll: true});
        }, 1800);
    }
    function blowCandles() {
        if (scene !== 'cake') { return; }
        scene = 'wish'; document.body.dataset.scene = scene; actions.hidden = true;
        S.Shape.switchShape(S.ShapeBuilder.cake(false), true, true);
        wish.hidden = false;
        announcement.textContent = 'Mong điều Thư vừa ước sẽ thành hiện thực.';
        document.getElementById('wish-message').focus({preventScroll: true});
        timer = setTimeout(function () {
            wish.hidden = true; scene = 'card'; document.body.dataset.scene = scene; card.hidden = false;
            document.getElementById('card-title').focus({preventScroll: true});
            celebrate();
        }, 4800);
    }
    function saveCard() {
        // Draw locally without external images, so export also works if image CORS is restricted.
        var canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1600;
        var c = canvas.getContext('2d'), gradient = c.createLinearGradient(0, 0, 1200, 1600);
        gradient.addColorStop(0, '#4b3226'); gradient.addColorStop(1, '#191211');
        c.fillStyle = gradient; c.fillRect(0, 0, 1200, 1600);
        c.strokeStyle = '#c9a46e'; c.lineWidth = 2; c.strokeRect(52, 52, 1096, 1496);
        c.textAlign = 'center'; c.fillStyle = '#e4be82'; c.font = '24px Arial';
        c.fillText('03.09.2026  ·  GỬI PHAN VÕ MINH THƯ', 600, 150);
        c.font = '86px Georgia'; c.fillStyle = '#fff0cd';
        c.fillText('Chúc mừng', 600, 320); c.fillText('sinh nhật nha!', 600, 425);
        c.font = '52px Georgia'; c.fillStyle = '#e4be82'; c.fillText('✧', 600, 540);
        function paragraph(text, y, font, lineHeight, maxWidth, measureOnly) {
            c.font = font;
            text.split('\n').forEach(function (paragraph) {
                var line = '';
                paragraph.split(' ').forEach(function (word) {
                    var next = line ? line + ' ' + word : word;
                    if (line && c.measureText(next).width > maxWidth) {
                        if (!measureOnly) { c.fillText(line, 600, y); }
                        y += lineHeight; line = word;
                    } else { line = next; }
                });
                if (!measureOnly) { c.fillText(line, 600, y); }
                y += lineHeight;
            });
            return y;
        }
        c.fillStyle = '#f1dbc0';
        var fontSize = 42;
        while (fontSize > 24 && paragraph(content.letter, 620, fontSize + 'px Arial', fontSize * 1.5, 920, true) > 1300) { fontSize -= 2; }
        var end = paragraph(content.letter, 620, fontSize + 'px Arial', fontSize * 1.5, 920);
        c.fillStyle = '#e4be82';
        paragraph(content.signature, Math.max(1370, end + 35), 'italic 56px Georgia', 64, 920);
        c.font = '22px Arial'; c.fillText('Một ngày thật đẹp dành cho Thư ♡', 600, 1490);
        canvas.toBlob(function (blob) {
            if (!blob) { announcement.textContent = 'Chưa tạo được ảnh. Bạn thử lưu thiệp lại nhé.'; return; }
            if (imageUrl) { URL.revokeObjectURL(imageUrl); }
            imageUrl = URL.createObjectURL(blob);
            document.getElementById('saved-card-image').src = imageUrl;
            document.getElementById('download-card').href = imageUrl;
            document.getElementById('save-preview').showModal();
        }, 'image/png');
    }
    document.getElementById('open-gift').addEventListener('click', function () { start(); toggleMusic(); });
    document.getElementById('replay').addEventListener('click', start);
    document.getElementById('blow-candles').addEventListener('click', blowCandles);
    document.getElementById('memory-next').addEventListener('click', function () {
        if (memoryIndex < content.memories.length - 1) { memoryIndex++; showMemory(); } else { finishMemories(); }
    });
    document.getElementById('memory-prev').addEventListener('click', function () {
        if (memoryIndex > 0) { memoryIndex--; showMemory(); }
    });
    document.getElementById('skip-memories').addEventListener('click', finishMemories);
    document.getElementById('open-letter').addEventListener('click', function () {
        letter.hidden = !letter.hidden;
        this.setAttribute('aria-expanded', String(!letter.hidden));
        if (!letter.hidden) { letter.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest'}); }
    });
    document.getElementById('save-card').addEventListener('click', saveCard);
    document.getElementById('close-preview').addEventListener('click', function () { document.getElementById('save-preview').close(); });
    document.getElementById('avatar-secret').addEventListener('click', function () {
        clearTimeout(secretTimer); document.getElementById('secret-message').hidden = false;
        secretTimer = setTimeout(function () { document.getElementById('secret-message').hidden = true; }, 4200);
    });
    musicButton.addEventListener('click', toggleMusic);
    document.addEventListener('visibilitychange', function () {
        clearTimeout(noteTimer);
        if (audio && master) {
            master.gain.value = document.hidden ? 0 : (musicOn ? .3 : 0);
            if (!document.hidden && musicOn) { audio.resume().then(playNote).catch(function () {}); }
        }
    });
    return { showCake: showCake, showMemories: showMemories };
}());

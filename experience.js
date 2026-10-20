'use strict';

var Experience = (function () {
    var intro = document.getElementById('intro'), card = document.getElementById('final-card'),
        actions = document.getElementById('cake-actions'), musicButton = document.getElementById('music'),
        announcement = document.getElementById('announcement'), timer, scene = 'intro';
    var messages = 'Chúc mừng|Sinh nhật|Phan Võ Minh Thư|#countdown 3|Chúc Thư|Luôn vui vẻ|Tài sắc vẹn toàn|và|Sớm có bằng lái|nhaaaa|#cake';

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
        clearTimeout(timer); scene = 'messages'; document.body.dataset.scene = scene;
        intro.hidden = true; card.hidden = true; actions.hidden = true; musicButton.hidden = false;
        announcement.textContent = 'Những lời chúc sinh nhật dành cho Thư.';
        S.UI.simulate(messages);
        musicButton.focus({preventScroll: true});
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
        announcement.textContent = 'Điều ước sẽ thành hiện thực. Chúc mừng sinh nhật Thư!';
        celebrate();
        timer = setTimeout(function () {
            scene = 'card'; document.body.dataset.scene = scene; card.hidden = false;
            document.getElementById('card-title').focus({preventScroll: true});
        }, 1600);
    }
    document.getElementById('open-gift').addEventListener('click', function () { start(); toggleMusic(); });
    document.getElementById('replay').addEventListener('click', start);
    document.getElementById('blow-candles').addEventListener('click', blowCandles);
    musicButton.addEventListener('click', toggleMusic);
    document.addEventListener('visibilitychange', function () {
        clearTimeout(noteTimer);
        if (audio && master) {
            master.gain.value = document.hidden ? 0 : (musicOn ? .3 : 0);
            if (!document.hidden && musicOn) { audio.resume().then(playNote).catch(function () {}); }
        }
    });
    return { showCake: showCake };
}());

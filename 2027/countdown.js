/*
 * CAAW deadline countdown.
 * Counts down to the next upcoming milestone and moves on automatically once
 * a deadline passes. Hides itself after the workshop.
 * Preview other dates with ?now=2026-11-13T20:00:00Z
 */
(function () {
    // Deadlines are end of day Anywhere on Earth (UTC-12).
    function aoe(y, m, d) { return Date.UTC(y, m - 1, d, 23, 59, 59) + 12 * 3600e3; }

    var MILESTONES = [
        { key: 'submission', label: 'Submission deadline', short: 'Submissions close', date: 'Nov 13, 2026', at: aoe(2026, 11, 13),
          cta: { text: 'Submit on EasyChair', href: 'https://easychair.org/conferences/?conf=caaw27' } },
        { key: 'notification', label: 'Acceptance notification', short: 'Notifications', date: 'Dec 18, 2026', at: aoe(2026, 12, 18) },
        { key: 'camera', label: 'Camera-ready deadline', short: 'Camera-ready due', date: 'Jan 5, 2027', at: aoe(2027, 1, 5) },
        // Barbados is UTC-4; workshop starts in the morning.
        { key: 'workshop', label: 'Workshop', short: 'Workshop starts', date: 'Feb 12, 2027', at: Date.UTC(2027, 1, 12, 13, 0, 0),
          cta: { text: 'Register via FC 2027', href: 'https://fc27.ifca.ai/' } }
    ];

    var offset = 0;
    var m = /[?&]now=([^&]+)/.exec(location.search);
    if (m) {
        var t = Date.parse(decodeURIComponent(m[1]));
        if (!isNaN(t)) offset = t - Date.now();
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function each(root, sel, fn) { Array.prototype.forEach.call(root.querySelectorAll(sel), fn); }

    var roots = document.querySelectorAll('[data-cd]');
    var timelines = document.querySelectorAll('[data-cd-timeline]');

    function tick() {
        var now = Date.now() + offset;
        var idx = -1;
        for (var i = 0; i < MILESTONES.length; i++) {
            if (MILESTONES[i].at > now) { idx = i; break; }
        }
        var ms = MILESTONES[idx];

        Array.prototype.forEach.call(roots, function (root) {
            if (!ms) { root.hidden = true; return; }
            root.hidden = false;
            var s = Math.floor((ms.at - now) / 1000);
            var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600),
                mi = Math.floor(s % 3600 / 60), se = s % 60;
            root.setAttribute('data-cd-key', ms.key);
            root.classList.toggle('cd-urgent', s < 3 * 86400);
            each(root, '[data-cd-days]', function (el) { el.textContent = d; });
            each(root, '[data-cd-hours]', function (el) { el.textContent = pad(h); });
            each(root, '[data-cd-mins]', function (el) { el.textContent = pad(mi); });
            each(root, '[data-cd-secs]', function (el) { el.textContent = pad(se); });
            each(root, '[data-cd-label]', function (el) { el.textContent = ms.label; });
            each(root, '[data-cd-short]', function (el) { el.textContent = ms.short; });
            each(root, '[data-cd-date]', function (el) { el.textContent = ms.date + (ms.key === 'workshop' ? '' : ' (AoE)'); });
            // Big single number: days, or hours on the last day.
            each(root, '[data-cd-big]', function (el) {
                el.textContent = d >= 2 ? d : (d * 24 + h);
            });
            each(root, '[data-cd-big-unit]', function (el) {
                el.textContent = d >= 2 ? 'days' : (d * 24 + h === 1 ? 'hour' : 'hours');
            });
            each(root, '[data-cd-cta]', function (el) {
                if (ms.cta) { el.hidden = false; el.textContent = ms.cta.text; el.href = ms.cta.href; }
                else { el.hidden = true; }
            });
        });

        Array.prototype.forEach.call(timelines, function (tl) {
            each(tl, '[data-cd-step]', function (el) {
                var k = el.getAttribute('data-cd-step');
                var i = -1;
                for (var j = 0; j < MILESTONES.length; j++) if (MILESTONES[j].key === k) i = j;
                el.classList.toggle('is-past', idx === -1 || i < idx);
                el.classList.toggle('is-next', i === idx);
            });
        });
    }

    tick();
    setInterval(tick, 1000);
})();

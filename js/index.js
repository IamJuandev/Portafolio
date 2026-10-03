/**
 * Portfolio behaviour: mobile nav, section highlighting, the "filling in the
 * form" entrance, validation stamps, and the AI assistant chat.
 */
(() => {
	"use strict";

	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// ============================================
	// NAVIGATION
	// ============================================
	const Navigation = {
		init() {
			this.nav = document.getElementById("nav");
			this.toggle = document.querySelector("[data-menu]");
			if (!this.nav || !this.toggle) return;

			this.toggle.addEventListener("click", () => this.setOpen(!this.isOpen()));
			this.nav.addEventListener("click", (event) => {
				if (event.target.closest("a")) this.setOpen(false);
			});
			document.addEventListener("keydown", (event) => {
				if (event.key === "Escape" && this.isOpen()) {
					this.setOpen(false);
					this.toggle.focus();
				}
			});

			this.trackSections();
		},

		isOpen() {
			return this.nav.classList.contains("is-open");
		},

		setOpen(open) {
			this.nav.classList.toggle("is-open", open);
			this.toggle.setAttribute("aria-expanded", String(open));
		},

		// Marks the nav link of the section currently crossing the upper third.
		trackSections() {
			const links = new Map(
				[...this.nav.querySelectorAll('a[href^="#"]')].map((link) => [
					link.getAttribute("href").slice(1),
					link,
				]),
			);
			const sections = [...links.keys()]
				.map((id) => document.getElementById(id))
				.filter(Boolean);
			if (!sections.length || !("IntersectionObserver" in window)) return;

			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!entry.isIntersecting) continue;
						for (const link of links.values()) link.removeAttribute("aria-current");
						links.get(entry.target.id)?.setAttribute("aria-current", "true");
					}
				},
				{ rootMargin: "-30% 0px -65% 0px" },
			);
			sections.forEach((section) => observer.observe(section));
		},
	};

	// ============================================
	// SIGNATURE MOTION: FILL + STAMP
	// ============================================
	const FormMotion = {
		init() {
			const head = document.querySelector(".doc-head");
			if (head) {
				head.querySelectorAll(".fill").forEach((el, index) => {
					el.style.setProperty("--i", String(index));
				});
				// Two frames so the clipped start state is painted before transitioning.
				requestAnimationFrame(() =>
					requestAnimationFrame(() => head.classList.add("is-filled")),
				);
			}

			const stamps = document.querySelectorAll("[data-stamp]");
			if (!stamps.length) return;

			if (!("IntersectionObserver" in window)) {
				stamps.forEach((stamp) => stamp.classList.add("is-stamped"));
				return;
			}

			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!entry.isIntersecting) continue;
						entry.target.classList.add("is-stamped");
						observer.unobserve(entry.target);
					}
				},
				{ rootMargin: "0px 0px -12% 0px", threshold: 1 },
			);
			stamps.forEach((stamp) => observer.observe(stamp));

			// Never leave a stamp invisible if the observer misses it (print, odd zoom).
			window.addEventListener("beforeprint", () =>
				stamps.forEach((stamp) => stamp.classList.add("is-stamped")),
			);
		},
	};

	// ============================================
	// AI ASSISTANT CHAT
	// ============================================
	const ChatAssistant = {
		webhookUrl: "https://n8n.arkanis.site/webhook/portfolio-chat",
		isSending: false,
		lastTrigger: null,

		// Identifies this tab so the assistant can follow up on earlier turns.
		// sessionStorage, not localStorage: the conversation ends with the tab.
		getChatId() {
			const key = "portfolio-chat-id";
			try {
				let chatId = sessionStorage.getItem(key);
				if (!chatId) {
					chatId = this.newId();
					sessionStorage.setItem(key, chatId);
				}
				return chatId;
			} catch {
				this.fallbackId ??= this.newId();
				return this.fallbackId;
			}
		},

		newId() {
			return typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
		},

		init() {
			this.panel = document.getElementById("chat");
			this.form = document.getElementById("chat-form");
			this.input = document.getElementById("chat-input");
			this.log = document.getElementById("chat-log");
			this.suggest = document.getElementById("chat-suggest");
			this.send = this.form?.querySelector(".chat__send");
			this.fab = document.querySelector(".chat-fab");
			if (!this.panel || !this.form || !this.input || !this.log) return;

			document.querySelectorAll("[data-chat-open]").forEach((button) => {
				button.addEventListener("click", () => this.open(button));
			});
			this.panel
				.querySelector("[data-chat-close]")
				?.addEventListener("click", () => this.close());

			document.addEventListener("keydown", (event) => {
				if (event.key === "Escape" && !this.panel.hidden) this.close();
			});

			this.suggest?.addEventListener("click", (event) => {
				const chip = event.target.closest(".chip-btn");
				if (!chip) return;
				this.input.value = chip.textContent.trim();
				this.form.requestSubmit();
			});

			this.form.addEventListener("submit", (event) => this.handleSubmit(event));
		},

		open(trigger) {
			this.lastTrigger = trigger;
			this.panel.hidden = false;
			this.fab?.setAttribute("aria-expanded", "true");
			// Focus after the panel becomes visible so the transition is not cut.
			setTimeout(() => this.input.focus({ preventScroll: true }), reduceMotion ? 0 : 60);
		},

		close() {
			this.panel.hidden = true;
			this.fab?.setAttribute("aria-expanded", "false");
			(this.lastTrigger?.isConnected ? this.lastTrigger : this.fab)?.focus({ preventScroll: true });
		},

		async handleSubmit(event) {
			event.preventDefault();
			if (this.isSending) return;

			const message = this.input.value.trim();
			if (!message) return;

			this.input.value = "";
			if (this.suggest) this.suggest.hidden = true;
			this.addMessage(message, "user");
			const pending = this.addMessage("Escribiendo", "pending");
			this.setSending(true);

			// Without a deadline a stalled request leaves the reply pending forever.
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 60000);

			try {
				const response = await fetch(this.webhookUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
					},
					body: new URLSearchParams({ message, chatId: this.getChatId() }),
					signal: controller.signal,
				});

				const data = await response.json().catch(() => ({}));
				if (data.answer) {
					this.resolve(pending, data.answer);
				} else {
					this.fail(pending, "No pude responder en este momento. Intenta de nuevo o escríbeme por WhatsApp.");
				}
			} catch (error) {
				this.fail(
					pending,
					error.name === "AbortError"
						? "La respuesta está tardando más de lo normal. Prueba de nuevo en un momento."
						: "No pude conectar con el asistente. Revisa tu conexión e intenta de nuevo.",
				);
			} finally {
				clearTimeout(timeoutId);
				this.setSending(false);
				this.scrollToBottom();
			}
		},

		setSending(sending) {
			this.isSending = sending;
			if (this.send) this.send.disabled = sending;
		},

		resolve(bubble, text) {
			bubble.className = "msg msg--bot";
			bubble.innerHTML = this.renderMarkdown(text);
			this.scrollToBottom();
		},

		fail(bubble, text) {
			bubble.className = "msg msg--bot msg--error";
			bubble.replaceChildren(Object.assign(document.createElement("p"), { textContent: text }));
		},

		// The assistant replies in Markdown. Escaping runs first and the tags are
		// built here, so anything the model emits stays inert text — the reply is
		// shaped by visitor input, which makes raw innerHTML an XSS route.
		renderMarkdown(text) {
			const escape = (value) =>
				String(value)
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;");

			const inline = (line) =>
				escape(line)
					.replace(/`([^`]+)`/g, "<code>$1</code>")
					.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
					.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
					.replace(
						/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
						'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
					)
					// Bare URLs, skipping the ones already turned into anchors above.
					.replace(
						/(^|[\s(])(https?:\/\/[^\s<)]+)/g,
						'$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>',
					);

			const html = [];
			let listItems = [];
			const flushList = () => {
				if (!listItems.length) return;
				html.push(`<ul>${listItems.join("")}</ul>`);
				listItems = [];
			};

			for (const rawLine of String(text).split("\n")) {
				const line = rawLine.trim();
				if (!line) {
					flushList();
					continue;
				}

				const bullet = line.match(/^[-*]\s+(.*)$/);
				if (bullet) {
					listItems.push(`<li>${inline(bullet[1])}</li>`);
					continue;
				}

				flushList();
				const heading = line.match(/^#{1,6}\s+(.*)$/);
				html.push(heading ? `<p><strong>${inline(heading[1])}</strong></p>` : `<p>${inline(line)}</p>`);
			}

			flushList();
			return html.join("");
		},

		addMessage(text, kind) {
			const bubble = document.createElement("div");
			bubble.className = `msg msg--${kind === "user" ? "user" : kind === "pending" ? "bot msg--pending" : "bot"}`;
			const paragraph = document.createElement("p");
			paragraph.textContent = text;
			bubble.appendChild(paragraph);
			this.log.appendChild(bubble);
			this.scrollToBottom();
			return bubble;
		},

		scrollToBottom() {
			this.log.scrollTop = this.log.scrollHeight;
		},
	};

	function init() {
		Navigation.init();
		FormMotion.init();
		ChatAssistant.init();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();

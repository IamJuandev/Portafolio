/**
 * Portfolio Optimization v2.0
 * Optimizado para máximo rendimiento en dispositivos móviles y desktop
 */

(() => {
	// ============================================
	// CONFIGURACIÓN CENTRALIZADA
	// ============================================
	const CONFIG = {
		particles: {
			count: 35, // Reducido de 50 a 35 para mejor rendimiento
			minSize: 1,
			maxSize: 4,
			minDuration: 8,
			maxDuration: 13,
			maxDelay: 5,
		},
		orbit: {
			speed: 0.005,
			bobbingIntensity: 10,
			bobbingSpeed: 2,
			iconPadding: 30,
		},
		resize: {
			debounceDelay: 150,
		},
	};

	// ============================================
	// MÓDULO DE PARTÍCULAS
	// ============================================
	const ParticleSystem = {
		init() {
			const container = document.getElementById("particle-container");
			if (!container) return;

			const fragment = document.createDocumentFragment();

			for (let i = 0; i < CONFIG.particles.count; i++) {
				const particle = this.createParticle();
				fragment.appendChild(particle);
			}

			// Una sola manipulación del DOM
			container.appendChild(fragment);
		},

		createParticle() {
			const particle = document.createElement("div");
			particle.className = "particle";

			const size =
				Math.random() * (CONFIG.particles.maxSize - CONFIG.particles.minSize) +
				CONFIG.particles.minSize;
			const duration =
				Math.random() *
					(CONFIG.particles.maxDuration - CONFIG.particles.minDuration) +
				CONFIG.particles.minDuration;
			const delay = Math.random() * CONFIG.particles.maxDelay;
			const left = Math.random() * 100;

			particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
            `;

			return particle;
		},
	};

	// ============================================
	// MÓDULO DE ÓRBITA
	// ============================================
	const OrbitSystem = {
		container: null,
		icons: null,
		iconCount: 0,
		angleStep: 0,
		angle: 0,
		radiusX: 0,
		radiusY: 0,
		animationId: null,
		isPaused: false,
		_boundAnimate: null,

		init() {
			this.container = document.getElementById("orbit-container");
			const nodeList = document.querySelectorAll(".tech-icon");

			if (!this.container || nodeList.length === 0) return;

			// Convertir NodeList a Array para iteración más rápida
			this.icons = Array.from(nodeList);
			this.iconCount = this.icons.length;
			this.angleStep = (2 * Math.PI) / this.iconCount;

			// Pre-bind para evitar crear funciones nuevas en cada frame
			this._boundAnimate = this.animate.bind(this);

			this.calculateDimensions();
			this.setupResizeHandler();
			this.setupHoverPause();
			this.startAnimation();
		},

		calculateDimensions() {
			const rect = this.container.getBoundingClientRect();
			this.radiusX = rect.width / 2 - CONFIG.orbit.iconPadding;
			this.radiusY = rect.height / 2 - CONFIG.orbit.iconPadding;
		},

		setupResizeHandler() {
			let resizeTimeout;
			const debouncedResize = () => {
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(() => {
					this.calculateDimensions();
				}, CONFIG.resize.debounceDelay);
			};

			window.addEventListener("resize", debouncedResize, { passive: true });
		},

		setupHoverPause() {
			this.icons.forEach((icon) => {
				icon.addEventListener("mouseenter", () => {
					this.isPaused = true;
				});
				icon.addEventListener("mouseleave", () => {
					this.isPaused = false;
				});
			});
		},

		animate() {
			if (!this.isPaused) {
				this.angle += CONFIG.orbit.speed;
			}

			const { angle, angleStep, radiusX, radiusY, icons } = this;
			const { bobbingSpeed, bobbingIntensity } = CONFIG.orbit;

			for (let i = 0; i < icons.length; i++) {
				const iconAngle = angle + i * angleStep;
				const x = radiusX * Math.cos(iconAngle);
				const y = radiusY * Math.sin(iconAngle);
				const bobbing = Math.sin(angle * bobbingSpeed + i) * bobbingIntensity;

				icons[i].style.transform = `translate3d(${x}px, ${y + bobbing}px, 0)`;
			}

			this.animationId = requestAnimationFrame(this._boundAnimate);
		},

		startAnimation() {
			if (this.animationId) {
				cancelAnimationFrame(this.animationId);
			}
			this.animate();
		},
	};

	// ============================================
	// MÓDULO DE NAVEGACIÓN CON TRANSICIONES SUAVES
	// ============================================
	const NavigationSystem = {
		navContainer: null,
		contentSections: null,
		activeSection: null,
		activeButton: null,
		isTransitioning: false,

		init() {
			const navButtons = document.querySelectorAll(".nav-btn");
			if (navButtons.length === 0) return;

			this.navContainer =
				navButtons[0].closest("nav") || navButtons[0].parentElement;
			this.contentSections = document.querySelectorAll(".content-section");

			// Encontrar la sección activa inicial
			this.activeSection = document.querySelector(
				".content-section:not(.hidden)",
			);
			this.activeButton = document.querySelector(".nav-btn.active");

			// Inicializar la primera sección como activa
			if (this.activeSection) {
				this.activeSection.classList.add("active");
				this.activeSection.classList.remove("hidden");
			}

			this.setupEventDelegation();
			this.initializeButtonStates(navButtons);
		},

		setupEventDelegation() {
			this.navContainer.addEventListener("click", (e) => {
				const button = e.target.closest(".nav-btn");

				if (!button || button === this.activeButton || this.isTransitioning)
					return;

				this.handleNavigation(button);
			});
		},

		initializeButtonStates(buttons) {
			buttons.forEach((btn) => {
				if (!btn.classList.contains("active")) {
					btn.classList.add("nav-btn-inactive");
				}
			});
		},

		handleNavigation(clickedButton) {
			// Prevenir múltiples clics durante la transición
			this.isTransitioning = true;

			// Actualizar botones
			if (this.activeButton) {
				this.activeButton.classList.remove("active");
				this.activeButton.classList.add("nav-btn-inactive");
			}

			clickedButton.classList.remove("nav-btn-inactive");
			clickedButton.classList.add("active");
			this.activeButton = clickedButton;

			// Cambiar contenido con animación
			const targetId = clickedButton.dataset.target;
			this.switchContentWithAnimation(targetId);
		},

		switchContentWithAnimation(targetId) {
			const newSection = document.getElementById(targetId);

			if (!newSection || newSection === this.activeSection) {
				this.isTransitioning = false;
				return;
			}

			// Paso 1: Hacer fade-out de la sección actual
			if (this.activeSection) {
				this.activeSection.classList.add("fade-out");
			}

			// Paso 2: Después de 250ms, ocultar la sección anterior y mostrar la nueva
			setTimeout(() => {
				// Ocultar sección anterior
				if (this.activeSection) {
					this.activeSection.classList.remove("active", "fade-out");
					this.activeSection.classList.add("hidden");
				}

				// Mostrar nueva sección
				newSection.classList.remove("hidden");

				// Trigger de reflow para que la animación funcione
				void newSection.offsetHeight;

				// Activar animación de entrada
				newSection.classList.add("active");

				this.activeSection = newSection;

				// Scroll suave hacia la nueva sección (solo si está fuera de vista)
				const rect = newSection.getBoundingClientRect();
				if (rect.top < 0 || rect.bottom > window.innerHeight) {
					newSection.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
				}

				// Permitir nuevas transiciones después de completar
				setTimeout(() => {
					this.isTransitioning = false;
				}, 400);
			}, 250);
		},
	};

	// ============================================
	// MÓDULO DE CHAT IA DEL PORTAFOLIO
	// ============================================
	const ChatAssistant = {
		webhookUrl: "https://n8n.arkanis.site/webhook/portfolio-chat",
		isSending: false,

		// Identifies this tab so the assistant can follow up on earlier turns.
		// sessionStorage, not localStorage: the conversation ends with the tab.
		getChatId() {
			const key = "portfolio-chat-id";
			let chatId = sessionStorage.getItem(key);
			if (!chatId) {
				chatId =
					typeof crypto !== "undefined" && crypto.randomUUID
						? crypto.randomUUID()
						: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
				sessionStorage.setItem(key, chatId);
			}
			return chatId;
		},

		init() {
			this.toggle = document.getElementById("ai-chat-toggle");
			this.panel = document.getElementById("ai-chat-panel");
			this.form = document.getElementById("ai-chat-form");
			this.input = document.getElementById("ai-chat-input");
			this.messages = document.getElementById("ai-chat-messages");

			if (
				!this.toggle ||
				!this.panel ||
				!this.form ||
				!this.input ||
				!this.messages
			)
				return;

			this.toggle.addEventListener("click", () => {
				this.panel.classList.toggle("hidden");
				if (!this.panel.classList.contains("hidden")) {
					this.input.focus();
				}
			});

			this.form.addEventListener("submit", (event) => this.handleSubmit(event));
		},

		async handleSubmit(event) {
			event.preventDefault();
			if (this.isSending) return;

			const message = this.input.value.trim();
			if (!message) return;

			this.input.value = "";
			this.addMessage(message, "user");
			const loadingMessage = this.addMessage("Pensando...", "assistant");
			this.isSending = true;

			try {
				const response = await fetch(this.webhookUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
					},
					body: new URLSearchParams({ message, chatId: this.getChatId() }),
				});

				const data = await response.json().catch(() => ({}));
				this.setMessage(
					loadingMessage,
					data.answer || "No pude responder en este momento. Intentá de nuevo.",
				);
			} catch (error) {
				loadingMessage.textContent =
					"No pude conectar con el asistente. Revisá que el workflow de n8n esté activo.";
			} finally {
				this.isSending = false;
				this.scrollToBottom();
			}
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
					.replace(/`([^`]+)`/g, '<code class="px-1 rounded bg-black/30 text-teal-300">$1</code>')
					.replace(
						/\*\*([^*]+)\*\*/g,
						'<strong class="font-semibold text-teal-300">$1</strong>',
					)
					.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
					.replace(
						/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
						'<a href="$2" target="_blank" rel="noopener noreferrer" class="text-teal-300 underline">$1</a>',
					)
					// Bare URLs, skipping the ones already turned into anchors above.
					.replace(
						/(^|[\s(])(https?:\/\/[^\s<)]+)/g,
						'$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-teal-300 underline">$2</a>',
					);

			const html = [];
			let listItems = [];

			// Custom markers instead of list-disc: a teal dot aligned to the first
			// line reads better than a grey bullet against the dark bubble.
			const flushList = () => {
				if (!listItems.length) return;
				html.push(`<ul class="my-2 space-y-2">${listItems.join("")}</ul>`);
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
					listItems.push(
						'<li class="flex gap-2.5">' +
							'<span class="text-teal-400 leading-6 select-none">•</span>' +
							`<span class="flex-1 leading-6">${inline(bullet[1])}</span>` +
							"</li>",
					);
					continue;
				}

				const heading = line.match(/^#{1,6}\s+(.*)$/);
				if (heading) {
					flushList();
					html.push(
						`<p class="font-semibold text-teal-300 mt-3 mb-1">${inline(heading[1])}</p>`,
					);
					continue;
				}

				flushList();
				html.push(`<p class="my-1.5 leading-6">${inline(line)}</p>`);
			}

			flushList();
			return html.join("");
		},

		addMessage(text, sender) {
			const bubble = document.createElement("div");
			bubble.className =
				sender === "user"
					? "p-3 rounded-xl bg-teal-500 text-gray-900 ml-8"
					: "p-3 rounded-xl bg-white/10 text-gray-200 mr-8 leading-relaxed";

			if (sender === "user") {
				bubble.textContent = text;
			} else {
				bubble.innerHTML = this.renderMarkdown(text);
			}

			this.messages.appendChild(bubble);
			this.scrollToBottom();
			return bubble;
		},

		setMessage(bubble, text) {
			bubble.innerHTML = this.renderMarkdown(text);
			this.scrollToBottom();
		},

		scrollToBottom() {
			this.messages.scrollTop = this.messages.scrollHeight;
		},
	};

	// ============================================
	// INICIALIZACIÓN PRINCIPAL
	// ============================================
	function initializePortfolio() {
		ParticleSystem.init();
		OrbitSystem.init();
		NavigationSystem.init();
		ChatAssistant.init();

		// Auto-scroll al contenido al cargar la página
		setTimeout(() => {
			const contentContainer = document.getElementById("content-container");
			if (contentContainer) {
				contentContainer.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}, 500);
	}

	// Esperar a que el DOM esté listo
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initializePortfolio);
	} else {
		initializePortfolio();
	}
})();

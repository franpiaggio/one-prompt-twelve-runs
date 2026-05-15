// ===== TYPEWRITER EFFECT =====
function typeWriter(element, text, speed = 80) {
    let index = 0;
    element.textContent = '';
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }
    
    // Start after initial animation delay
    setTimeout(type, 1200);
}

// Initialize typewriter for primary role
const primaryRoleText = document.querySelector('.primary-role .role-text');
if (primaryRoleText) {
    const text = primaryRoleText.getAttribute('data-text');
    typeWriter(primaryRoleText, text, 70);
}

// ===== CURSOR GLOW =====
const cursorGlow = document.querySelector('.cursor-glow');
let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

// Check if device has fine pointer (not touch)
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

if (hasFinePointer && cursorGlow) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateCursor() {
        // Smooth follow with lerp
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        
        cursorGlow.style.left = currentX + 'px';
        cursorGlow.style.top = currentY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
}

// ===== PARALLAX ON SCROLL =====
const geoShapes = document.querySelectorAll('.geo-shape');

if (hasFinePointer) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        geoShapes.forEach((shape, index) => {
            const speed = index === 0 ? 0.3 : 0.2;
            shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ===== DOT GRID INTERACTION =====
const dotGrid = document.querySelector('.dot-grid');

if (hasFinePointer && dotGrid) {
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        
        // Subtle shift of dot grid based on mouse position
        dotGrid.style.transform = `translate(${(x - 50) * 0.02}px, ${(y - 50) * 0.02}px)`;
    });
}

// ===== REDUCED MOTION =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Disable cursor glow animation
    if (cursorGlow) {
        cursorGlow.style.transition = 'none';
    }
    
    // Stop floating animations
    geoShapes.forEach(shape => {
        shape.style.animation = 'none';
    });
}

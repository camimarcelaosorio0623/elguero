import './styles/main.css';
import { isDemo } from './config/env.js';
import { initHeader, initFab, initReveal } from './components/header.js';
import { initHeroVideo, initGlobo, initEstado } from './components/hero.js';
import { initCantarito } from './components/cantarito.js';
import { initMenu } from './components/menu.js';
import { initPromotions, initEvents } from './components/promos-events.js';
import { initReservationForm, initBirthdayForm } from './components/forms.js';
import { initHorario, initWhatsApp } from './components/location.js';

document.getElementById('demo-flag').hidden = !isDemo;

initHeader();
initHeroVideo();
initEstado();
initGlobo();
initReveal();
initCantarito();
initMenu();
initPromotions();
initEvents();
initReservationForm();
initBirthdayForm();
initHorario();
initWhatsApp();
initFab();

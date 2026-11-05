/* Altere estes dados para configurar a consulta. Datas usam o horário de Brasília. */
const DELIVERY = Object.freeze({
  code: 'BRAA131VNJN087MCSP',
  startsAt: '2026-11-09T00:00:00-03:00',
});

function normalizeCode(value) {
  return String(value).trim().toUpperCase();
}

function isOnRoute(now = new Date()) {
  return now.getTime() >= new Date(DELIVERY.startsAt).getTime();
}

const form = document.getElementById('tracking-form');
const input = document.getElementById('tracking-code');
const error = document.getElementById('input-error');
const result = document.getElementById('tracking-result');
let shipmentFound = false;
let lastRouteState = null;

function updateDelivery() {
  if (!shipmentFound) return;
  const moving = isOnRoute();
  if (moving === lastRouteState) return;
  lastRouteState = moving;
  document.getElementById('journey').classList.toggle('on-route', moving);
  document.getElementById('status-badge').classList.toggle('moving', moving);
  document.getElementById('status-text').textContent = moving ? 'A caminho' : 'Entrega agendada';
  document.getElementById('truck-scene').setAttribute('aria-label', moving
    ? 'Ilustração de um caminhão em movimento: encomenda a caminho'
    : 'Ilustração de um caminhão aguardando a data de saída');
  document.getElementById('scene-tag').textContent = moving ? 'A caminho do seu endereço' : 'Entrega prevista · 09 de novembro';
  document.getElementById('scene-title').textContent = moving ? 'Seu pedido está a caminho.' : 'Uma data para esperar com carinho.';
  document.getElementById('scene-description').textContent = moving ? 'Previsão: 09/11/2026, em horário comercial.' : 'Entrega agendada para 09/11, em horário comercial.';
  document.getElementById('route-step').classList.toggle('active', moving);
  if (moving) document.getElementById('route-step').setAttribute('aria-current', 'step');
  else document.getElementById('route-step').removeAttribute('aria-current');
  document.getElementById('route-description').textContent = moving ? 'A caminho do endereço informado' : 'A partir de 09/11';
  document.getElementById('delivery-message').innerHTML = moving
    ? 'Sua encomenda está <strong>a caminho</strong>. Previsão de entrega: <strong>09/11/2026, em horário comercial</strong>, no endereço acima.'
    : 'Sua entrega está prevista para <strong>09/11/2026, em horário comercial</strong>, no endereço acima.';
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const code = normalizeCode(input.value);
  if (code !== DELIVERY.code) {
    error.textContent = code ? 'Código não encontrado. Confira os caracteres e tente novamente.' : 'Digite o código da sua encomenda para continuar.';
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    result.hidden = true;
    shipmentFound = false;
    lastRouteState = null;
    document.getElementById('journey').classList.remove('on-route');
    document.getElementById('truck-scene').setAttribute('aria-label', 'Ilustração de um caminhão de entregas aguardando a consulta');
    document.getElementById('scene-tag').textContent = 'O próximo destino é você';
    document.getElementById('scene-title').textContent = 'Todo caminho leva a uma chegada.';
    document.getElementById('scene-description').textContent = 'Consulte seu código e veja a previsão de entrega.';
    input.focus();
    return;
  }
  input.value = code;
  error.hidden = true;
  input.removeAttribute('aria-invalid');
  shipmentFound = true;
  result.hidden = false;
  updateDelivery();
  document.getElementById('result-heading').focus({ preventScroll: true });
  result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
});

input.addEventListener('input', () => {
  error.hidden = true;
  input.removeAttribute('aria-invalid');
});

// Reavalia enquanto a página está aberta e ao voltar para a aba.
// O status não muda para "entregue" sem uma confirmação real.
setInterval(updateDelivery, 1000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateDelivery();
});
window.addEventListener('focus', updateDelivery);

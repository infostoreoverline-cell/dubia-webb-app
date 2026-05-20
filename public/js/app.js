// Logica Frontend per Dashboard D.U.B.I.A.

document.addEventListener('DOMContentLoaded', () => {
    // In un ambiente di produzione vero, faremo una fetch al nostro proxy (Netlify Function) 
    // che a sua volta chiamerà Google Sheets per non esporre l'URL o avere problemi di CORS.
    // Per ora, simuliamo il caricamento dati basato sul Teorema
    
    initCharts();
    simulateDataFetch();
});

function initCharts() {
    // Grafico a Linee (Crescita)
    const ctxGrowth = document.getElementById('growthChart').getContext('2d');
    new Chart(ctxGrowth, {
        type: 'line',
        data: {
            labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu'],
            datasets: [{
                label: 'Biomassa Totale (g)',
                data: [1200, 1350, 1500, 1520, 1700, 1845],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Grafico a Torta (Demografia - Applicazione Teorema 35/65)
    const ctxDemo = document.getElementById('demographicChart').getContext('2d');
    new Chart(ctxDemo, {
        type: 'doughnut',
        data: {
            labels: ['Femmine (Ripr.)', 'Maschi (Ripr.)', 'Neanidi Medie', 'Baby'],
            datasets: [{
                data: [199, 99, 1049, 3598], // Dati stimati su 1845g (dal PDF)
                backgroundColor: [
                    '#EC4899', // Pink
                    '#3B82F6', // Blue
                    '#8B5CF6', // Purple
                    '#FCD34D'  // Yellow
                ]
            }]
        },
        options: { responsive: true }
    });
}

function simulateDataFetch() {
    // Simuliamo l'ultimo inserimento fatto via Telegram: 1845g
    const lastWeight = 1845;
    
    // Applicazione Teorema (Frontend Demo)
    const W_adulti = lastWeight * 0.35;
    const W_neanidi = lastWeight * 0.65;
    
    document.getElementById('kpiBiomassa').textContent = lastWeight + ' g';
    document.getElementById('kpiAdulti').textContent = Math.round(W_adulti) + ' g';
    document.getElementById('kpiNeanidi').textContent = Math.round(W_neanidi) + ' g';
    
    // Rilevamento anomalie fittizio per Health Monitoring
    const expectedWeight = 1900;
    const salute = (lastWeight / expectedWeight) * 100;
    
    const kpiSalute = document.getElementById('kpiSalute');
    kpiSalute.textContent = Math.round(salute) + '%';
    if(salute < 90) {
        kpiSalute.classList.remove('text-green-600');
        kpiSalute.classList.add('text-red-500');
    }
}

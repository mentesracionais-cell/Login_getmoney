// App initialization and global functions

// Função para inicializar a aplicação
async function init() {
    console.log('Iniciando aplicação...');
    
    // Initialize app
    initializeApp();
    
    // Check if user is logged in
    const loggedInUserPhone = sessionStorage.getItem('logged_in_user_phone');
    console.log('Usuário logado:', loggedInUserPhone);
    
    if (loggedInUserPhone) {
        const users = JSON.parse(localStorage.getItem('getmoney_users') || '[]');
        const currentUser = users.find(user => user.phone === loggedInUserPhone);
        
        if (currentUser) {
            console.log('Usuário encontrado:', currentUser);
            updateUserUI(currentUser);
        } else {
            console.log('Usuário não encontrado no banco de dados');
            // User not found in database
            sessionStorage.removeItem('logged_in_user_phone');
            window.location.href = 'login.html';
        }
    } else {
        console.log('Usuário não está logado');
        // Redirect to login if not logged in (except for login and signup pages)
        const currentPage = window.location.pathname.split('/').pop() || 'home.html';
        if (!['login.html', 'signup.html'].includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
}

// Aguardar o carregamento do DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
    // Criar usuário de teste se não existir
    const testUser = {
        name: 'Usuário Teste',
        phone: '123456789',
        balance: 500000,
        investments: []
    };
    
    if (!localStorage.getItem('getmoney_users')) {
        localStorage.setItem('getmoney_users', JSON.stringify([testUser]));
    }
    
    // Definir usuário como logado
    if (!sessionStorage.getItem('logged_in_user_phone')) {
        sessionStorage.setItem('logged_in_user_phone', testUser.phone);
    }
    
    init();
});
} else {
    init();
}

function initializeApp() {
    console.log("Inicializando aplicação...");
    try {
        setupNavigation();
        setupNotificationSystem();
        setupLogoutButton();
        setupTabs();
        console.log("Aplicação inicializada com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar a aplicação:", error);
    }
}

function setupNavigation() {
    console.log("Configurando navegação...");
    try {
        // Add active class to current page in bottom navigation
        const currentPage = window.location.pathname.split('/').pop() || 'home.html';
        console.log("Página atual:", currentPage);
        
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        console.log("Itens de navegação encontrados:", navItems.length);
        
        navItems.forEach(item => {
            if (item.getAttribute('href') === currentPage) {
                item.classList.add('active');
                console.log("Item ativo:", item.getAttribute('href'));
            } else {
                item.classList.remove('active');
            }
        });
    } catch (error) {
        console.error("Erro ao configurar navegação:", error);
    }
}

function investInPlan(planId, price) {
    console.log('Iniciando investimento...', { planId, price });
    
    const loggedInUserPhone = sessionStorage.getItem('logged_in_user_phone');
    if (!loggedInUserPhone) {
        console.log('Usuário não está logado, redirecionando para login');
        window.location.href = 'login.html';
        return;
    }

    try {
        console.log('Buscando dados do usuário...');
        const users = JSON.parse(localStorage.getItem('getmoney_users') || '[]');
        console.log('Usuários encontrados:', users.length);
        
        const userIndex = users.findIndex(user => user.phone === loggedInUserPhone);
        console.log('Índice do usuário:', userIndex);
        
        if (userIndex !== -1) {
            const user = users[userIndex];
            console.log('Dados do usuário:', user);
            
            // Verificar se o usuário tem saldo suficiente
            if (!user.balance || user.balance < price) {
                console.log('Saldo insuficiente:', { saldoAtual: user.balance, precoInvestimento: price });
                showNotification('Saldo insuficiente para este investimento', 'error');
                return;
            }

            // Atualizar investimentos do usuário
            user.investments = user.investments || [];
            const novoInvestimento = {
                plan: planId,
                value: price,
                date: new Date().toISOString()
            };
            user.investments.push(novoInvestimento);
            console.log('Novo investimento adicionado:', novoInvestimento);

            // Deduzir o valor do saldo
            const saldoAnterior = user.balance;
            user.balance -= price;
            console.log('Saldo atualizado:', { saldoAnterior, saldoNovo: user.balance });

            // Salvar alterações
            localStorage.setItem('getmoney_users', JSON.stringify(users));
            console.log('Dados salvos no localStorage');
            
            updateUserUI(user);

            const mensagem = `Investimento de ${price.toLocaleString('pt-BR')} KZ no plano ${planId} realizado com sucesso!`;
            console.log(mensagem);
            showNotification(mensagem, 'success');
        } else {
            console.error('Usuário não encontrado no banco de dados');
            showNotification('Erro: Usuário não encontrado', 'error');
        }
    } catch (error) {
        console.error('Erro ao processar investimento:', error);
        showNotification('Erro ao processar investimento', 'error');
    }
}

function setupLogoutButton() {
    // Procura por qualquer elemento que tenha a palavra "Sair" no texto
    const logoutButtons = document.querySelectorAll('a, button, [role="button"]');
    logoutButtons.forEach(button => {
        if (button.textContent.trim().toLowerCase().includes('sair')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('logged_in_user_phone');
                window.location.href = 'login.html';
            });
        }
    });
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            tabContents[index].classList.add('active');
        });
    });
}

function setupNotificationSystem() {
    // Setup notification container if it doesn't exist
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
}

function showNotification(message, type = 'info') {
    const container = document.querySelector('.notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    
    const icon = document.createElement('div');
    icon.className = 'notification-icon';
    icon.innerHTML = type === 'success' ? 
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="M22 4L12 14.01l-3-3"></path></svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.textContent = message;
    
    notification.appendChild(icon);
    notification.appendChild(content);
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateUserUI(user) {
    console.log('Atualizando interface do usuário...', user);
    try {
        // Update user initial in avatar
        const userInitialElements = document.querySelectorAll('#user-initial, #user-avatar-initial');
        console.log('Elementos de inicial do usuário encontrados:', userInitialElements.length);
        
        if (userInitialElements.length > 0 && user.name) {
            const initial = user.name.charAt(0).toUpperCase();
            userInitialElements.forEach(el => el.textContent = initial);
            console.log('Inicial do usuário atualizada:', initial);
        }
        
        // Update user info in profile page if available
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = user.name || 'Usuário';
            console.log('Nome do usuário atualizado:', userNameEl.textContent);
        }
        
        const userPhoneEl = document.getElementById('user-phone');
        if (userPhoneEl) {
            userPhoneEl.textContent = user.phone || '+55 (XX) XXXXX-XXXX';
            console.log('Telefone do usuário atualizado:', userPhoneEl.textContent);
        }
        
        // Update user balance on home page
        const userBalanceEl = document.getElementById('user-balance');
        if (userBalanceEl) {
            const formattedBalance = `${(user.balance || 0).toLocaleString('pt-BR')} KZ`;
            userBalanceEl.textContent = formattedBalance;
            console.log('Saldo do usuário atualizado:', formattedBalance);
        }
        
        console.log('Interface do usuário atualizada com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar interface do usuário:', error);
    }
}

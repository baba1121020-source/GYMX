import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// Navbar scroll
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    // Fade-up animation
    document.querySelectorAll('.fade-up, .card-animate').forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) section.classList.add('visible');
    });

    // Hero parallax
    const heroText = document.querySelector('.hero-content');
    if (heroText) {
        heroText.style.transform = `translateY(calc(-50% + ${window.scrollY * 0.3}px))`;
        heroText.style.opacity = `${1 - window.scrollY / 600}`;
    }

    // About image parallax
    const aboutImg = document.querySelector('#about img');
    if (aboutImg) aboutImg.style.transform = `translateY(${window.scrollY * 0.1}px)`;

    // Back to top
    const backToTop = document.getElementById('back-to-top');
    if (window.scrollY > 300) {
        backToTop.style.opacity = '1';
        backToTop.style.visibility = 'visible';
    } else {
        backToTop.style.opacity = '0';
        backToTop.style.visibility = 'hidden';
    }
});

// Smooth scroll for nav links
document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

// Back to top
document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Chatbot
const chatToggle = document.getElementById('chat-toggle');
const chatBox = document.getElementById('chat-box');
const chatBody = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');
chatToggle.addEventListener('click', () => {
    chatBox.style.display = chatBox.style.display === 'flex' ? 'none' : 'flex';
    chatBox.style.flexDirection = 'column';
});

const botReplies = [
    { keywords: ['hi', 'hello', 'hey'], reply: 'Hello! Welcome to GymX! How can I help you today?' },
    { keywords: ['address', 'location', 'where'], reply: 'We are located in Noida Sector 15, Uttar Pradesh, India. Check the map above!' },
    { keywords: ['services', 'service', 'what do you offer'], reply: 'We offer Hot Bath, Spa, Exercise, Cardio, Zumba, Yoga, Personal Training, Nutrition Plans.' },
    { keywords: ['plans', 'pricing', 'membership', 'subscription'], reply: 'We have Basic, Standard, Premium plans. Toggle Monthly/Yearly in Pricing section.' },
    { keywords: ['timings', 'hours', 'open', 'close'], reply: 'Our gym is open Mon-Sat: 6am-10pm, Sun: 8am-8pm.' },
    { keywords: ['contact', 'email', 'phone'], reply: 'Email: example@gmail.com or reach via WhatsApp.' },
    { keywords: ['thanks', 'thank', 'bye'], reply: 'You are welcome! Stay fit and healthy!' }
];

function getBotReply(message) {
    message = message.toLowerCase();
    for (let item of botReplies) {
        for (let key of item.keywords) {
            if (message.includes(key)) return item.reply;
        }
    }
    return "Sorry, I didn't understand that. Ask about services, address, pricing, or timings.";
}

chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && chatInput.value.trim() !== '') {
        const userMsg = chatInput.value;
        chatBody.innerHTML += `<div class="message user">${userMsg}</div>`;
        chatInput.value = '';
        setTimeout(() => {
            const botMsg = getBotReply(userMsg);
            chatBody.innerHTML += `<div class="message bot">${botMsg}</div>`;
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 500);
    }
});

// Pricing toggle
const pricingToggle = document.getElementById('pricing-toggle');
const pricingCards = document.querySelectorAll('.pricing-card');
pricingToggle.addEventListener('change', () => {
    pricingCards.forEach(card => {
        const priceTag = card.querySelector('.price strong');
        priceTag.innerText = pricingToggle.checked ? card.dataset.yearly + ' / year' : card.dataset.monthly + ' / month';
    });
});

// Services Carousel Auto Scroll
const serviceSlider = document.getElementById('service-slider');
let scrollAmount = 0;
function autoScrollServices() {
    scrollAmount += 1;
    if (scrollAmount >= serviceSlider.scrollWidth / 2) scrollAmount = 0;
    serviceSlider.style.transform = `translateX(-${scrollAmount}px)`;
    requestAnimationFrame(autoScrollServices);
}
requestAnimationFrame(autoScrollServices);

// BMI Calculator
const calculateBtn = document.getElementById('calculate');
const resultsDiv = document.getElementById('results');

calculateBtn.addEventListener('click', () => {
    const name = document.getElementById('name').value;
    const weightRaw = parseFloat(document.getElementById('weight').value);
    const weightUnit = document.getElementById('weight-unit').value;
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activity = parseFloat(document.getElementById('activity').value);
    const goal = document.getElementById('goal').value;

    // Convert weight to kg if input is in lb
    const weight = weightUnit === 'lb' ? weightRaw * 0.453592 : weightRaw;

    // Height conversion ft'inches -> meters
    const heightInput = document.getElementById('height').value.trim();
    const heightMatch = heightInput.match(/^(\d+)'(\d+)"?$/);
    if(!heightMatch){ alert("Enter height like 5'11"); return; }
    const feet = parseInt(heightMatch[1]);
    const inches = parseInt(heightMatch[2]);
    const heightMeters = ((feet * 12) + inches) * 0.0254;

    if(!weight || !heightMeters || !age){ alert("Please enter valid numbers"); return; }

    // BMI calculation
    const bmiNum = weight / (heightMeters * heightMeters);
    let bmiStatus='';
    if(bmiNum < 18.5) bmiStatus='Underweight';
    else if(bmiNum<24.9) bmiStatus='Normal';
    else if(bmiNum<29.9) bmiStatus='Overweight';
    else bmiStatus='Obese';
    document.getElementById('bmiResult').innerText = `BMI: ${bmiNum.toFixed(1)} (${bmiStatus})`;

    // Body Fat %
    let bodyFatNum;
    if(gender==='male'){
        bodyFatNum = (1.20 * bmiNum) + (0.23 * age) - 16.2;
    } else {
        bodyFatNum = (1.20 * bmiNum) + (0.23 * age) - 5.4;
    }
    let bfStatus='';
    if(gender==='male'){
        if(bodyFatNum<6) bfStatus='Underfat';
        else if(bodyFatNum<=24) bfStatus='Healthy';
        else if(bodyFatNum<=31) bfStatus='Overfat';
        else bfStatus='Obese';
    } else {
        if(bodyFatNum<16) bfStatus='Underfat';
        else if(bodyFatNum<=30) bfStatus='Healthy';
        else if(bodyFatNum<=36) bfStatus='Overfat';
        else bfStatus='Obese';
    }
    document.getElementById('bodyFatResult').innerText = `Body Fat %: ${bodyFatNum.toFixed(1)} (${bfStatus})`;

    // BMR & Calories
    const bmr = gender==='male'
        ? 10*weight + 6.25*heightMeters*100 - 5*age + 5
        : 10*weight + 6.25*heightMeters*100 - 5*age -161;

    let calories = bmr * activity;
    if(goal==='lose') calories -= 500;
    else if(goal==='gain') calories += 500;

    document.getElementById('caloriesResult').innerText = `Daily Calories: ${Math.round(calories)}`;

    resultsDiv.classList.remove('hidden');

    // Chart
    const ctx = document.getElementById('bmi-chart').getContext('2d');
    new Chart(ctx, {
        type:'bar',
        data:{
            labels:['BMI','Body Fat %'],
            datasets:[{label:'Value',data:[bmiNum,bodyFatNum],backgroundColor:['#e74c3c','#3498db']}]
        },
        options:{scales:{y:{beginAtZero:true,max:Math.max(bmiNum,bodyFatNum)+10}},plugins:{legend:{display:false}}}
    });
});

// PDF Download
document.getElementById('downloadPDF').addEventListener('click', async ()=> {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const name = document.getElementById('name').value;
    const bmiText = document.getElementById('bmiResult').innerText;
    const bfText = document.getElementById('bodyFatResult').innerText;
    const calText = document.getElementById('caloriesResult').innerText;

    doc.setFontSize(16);
    doc.text(`GymX Fitness Report`,20,20);
    doc.setFontSize(12);
    doc.text(`Name: ${name}`,20,30);
    doc.text(bmiText,20,40);
    doc.text(bfText,20,50);
    doc.text(calText,20,60);

    const chartImg = document.getElementById('bmi-chart').toDataURL('image/png',1.0);
    doc.addImage(chartImg,'PNG',20,70,170,60);
    doc.save('GymX_Fitness_Report.pdf');
});

// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const navList = document.getElementById('nav-list');
if (menuToggle && navList) {
  menuToggle.addEventListener('click', function() {
    navList.classList.toggle('open');
  });
}

// Signup modal logic
function setupSignupModal() {
  const modal = document.getElementById('signup-modal');
  const signupBtn = document.getElementById('signup-modal-btn');
  if (!modal || !signupBtn) return;
  document.body.classList.add('signup-blur');
  modal.style.display = 'flex';

  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDexZBi7JfkLQYhiyib_a26ILMkkepmZLk",
    authDomain: "gymx-42c38.firebaseapp.com",
    projectId: "gymx-42c38",
    storageBucket: "gymx-42c38.firebasestorage.app",
    messagingSenderId: "871427638541",
    appId: "1:871427638541:web:240f13929d674ca3bedc44"
  };
  // Initialize Firebase
  if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }
  const auth = firebase.auth();
  auth.onAuthStateChanged(function(user) {
    if (user) {
      modal.style.display = 'none';
      document.body.classList.remove('signup-blur');
    } else {
      modal.style.display = 'flex';
      document.body.classList.add('signup-blur');
    }
  });
  signupBtn.addEventListener('click', function() {
    window.location.href = 'signup.html';
  });
}
document.addEventListener('DOMContentLoaded', setupSignupModal);

// Footer profile menu toggle
const profileImg = document.getElementById('footer-profile-img');
const profileMenu = document.getElementById('profile-menu');
if (profileImg && profileMenu) {
  profileImg.addEventListener('click', function(e) {
    e.stopPropagation();
    profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
  });
  document.addEventListener('click', function(e) {
    if (profileMenu.style.display === 'block' && !profileMenu.contains(e.target) && e.target !== profileImg) {
      profileMenu.style.display = 'none';
    }
  });
}
// Example menu actions
const menuSignup = document.getElementById('menu-signup');
if (menuSignup) {
  menuSignup.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'signup.html';
  });
}
const menuLogout = document.getElementById('menu-logout');
if (menuLogout) {
  menuLogout.addEventListener('click', function(e) {
    e.preventDefault();
    if (typeof firebase !== 'undefined') {
      const auth = firebase.auth();
      auth.signOut().then(function() {
        window.location.reload();
      }).catch(function(error) {
        alert('Logout failed: ' + error.message);
      });
    }
  });
}
const menuSettings = document.getElementById('menu-settings');
if (menuSettings) {
  menuSettings.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'setting.html';
  });
}

// Update profile info in footer if user is logged in
if (typeof firebase !== 'undefined') {
  const auth = firebase.auth();
  auth.onAuthStateChanged(user => {
    const profileName = document.getElementById('footer-profile-name');
    const profileImg = document.getElementById('footer-profile-img');
    if (profileName && profileImg) {
      if (user) {
        profileName.textContent = user.displayName || user.email || 'User';
        if (user.photoURL) {
          profileImg.src = user.photoURL;
        } else {
          profileImg.src = "https://img.icons8.com/color/96/000000/user-male-circle--v2.png";
        }
      } else {
        profileName.textContent = 'Guest';
        profileImg.src = "https://img.icons8.com/color/96/000000/user-male-circle--v2.png";
      }
    }
  });
}

// --- Signup page JS (modular API, Google sign-up removed) ---
if (window.location.pathname.endsWith('signup.html')) {
  const firebaseConfig = {
    apiKey: "AIzaSyDexZBi7JfkLQYhiyib_a26ILMkkepmZLk",
    authDomain: "gymx-42c38.firebaseapp.com",
    projectId: "gymx-42c38",
    storageBucket: "gymx-42c38.firebasestorage.app",
    messagingSenderId: "871427638541",
    appId: "1:871427638541:web:240f13929d674ca3bedc44"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  const signupMsg = document.getElementById('signup-message');
  const signupBtn = document.getElementById('signup-btn');

  signupBtn.addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await set(ref(db, 'users/' + userCredential.user.uid), { email });
      signupMsg.innerText = 'Sign up successful! Redirecting...';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } catch (error) {
      signupMsg.innerText = error.message;
    }
  });
}
// --- Settings page JS ---
if (window.location.pathname.endsWith('setting.html')) {
  import('https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js').then(({ initializeApp }) => {
    import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js').then(({ getAuth }) => {
      import('https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js').then(({ getDatabase, ref, set }) => {
        const firebaseConfig = {
          apiKey: "AIzaSyDexZBi7JfkLQYhiyib_a26ILMkkepmZLk",
          authDomain: "gymx-42c38.firebaseapp.com",
          projectId: "gymx-42c38",
          storageBucket: "gymx-42c38.firebasestorage.app",
          messagingSenderId: "871427638541",
          appId: "1:871427638541:web:240f13929d674ca3bedc44"
        };
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const auth = getAuth(app);
        document.getElementById('profile-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          const user = auth.currentUser;
          if (!user) {
            document.getElementById('settings-message').innerText = 'You must be logged in to update your profile.';
            return;
          }
          const name = document.getElementById('name').value;
          const age = document.getElementById('age').value;
          const gender = document.getElementById('gender').value;
          const contact = document.getElementById('contact').value;
          let photoUrl = document.getElementById('profile-photo-preview').src;
          try {
            await set(ref(db, 'users/' + user.uid + '/profile'), {
              name,
              age,
              gender,
              contact,
              photoUrl
            });
            document.getElementById('settings-message').innerText = 'Profile updated!';
          } catch (error) {
            document.getElementById('settings-message').innerText = error.message;
          }
        });
        document.getElementById('profile-photo').addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
              document.getElementById('profile-photo-preview').src = evt.target.result;
            };
            reader.readAsDataURL(file);
          }
        });
      });
    });
  });
}
// --- Login page JS ---
if (window.location.pathname.endsWith('login.html')) {
  import('https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js').then(({ initializeApp }) => {
    import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js').then(({ getAuth, signInWithEmailAndPassword }) => {
      const firebaseConfig = {
        apiKey: "AIzaSyDexZBi7JfkLQYhiyib_a26ILMkkepmZLk",
        authDomain: "gymx-42c38.firebaseapp.com",
        projectId: "gymx-42c38",
        storageBucket: "gymx-42c38.firebasestorage.app",
        messagingSenderId: "871427638541",
        appId: "1:871427638541:web:240f13929d674ca3bedc44"
      };
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const loginBtn = document.getElementById('login-btn');
      const loginMsg = document.getElementById('login-message');
      loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
          await signInWithEmailAndPassword(auth, email, password);
          loginMsg.innerText = 'Login successful!';
          setTimeout(() => {
            window.location.href = 'gym2.html';
          }, 1000);
        } catch (error) {
          loginMsg.innerText = error.message;
          if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            document.getElementById('forgot-link').style.display = 'block';
          }
        }
      });
    });
  });
}
// --- Forgot page JS ---
if (window.location.pathname.endsWith('forgot.html')) {
  import('https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js').then(({ initializeApp }) => {
    import('https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js').then(({ getAuth, sendPasswordResetEmail }) => {
      const firebaseConfig = {
        apiKey: "AIzaSyDexZBi7JfkLQYhiyib_a26ILMkkepmZLk",
        authDomain: "gymx-42c38.firebaseapp.com",
        projectId: "gymx-42c38",
        storageBucket: "gymx-42c38.firebasestorage.app",
        messagingSenderId: "871427638541",
        appId: "1:871427638541:web:240f13929d674ca3bedc44"
      };
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const forgotBtn = document.getElementById('forgot-btn');
      const forgotMsg = document.getElementById('forgot-message');
      forgotBtn.addEventListener('click', async () => {
        const email = document.getElementById('forgot-email').value;
        try {
          await sendPasswordResetEmail(auth, email);
          forgotMsg.innerText = 'Password reset email sent! Check your inbox.';
        } catch (error) {
          forgotMsg.innerText = error.message;
        }
      });
    });
  });
}

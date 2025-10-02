import React, { useEffect } from 'react';
import BlurText from './BlurText';

interface Message {
    text: string;
    sender: 'me' | 'other';
}

const ConnectSpherePage: React.FC = () => {

    useEffect(() => {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow) {
            const messages: Message[] = [
                { text: "Hey! Are we still on for tonight?", sender: 'other' },
                { text: "Absolutely! I'm looking forward to it. 😊", sender: 'me' },
                { text: "Great! I was thinking we could try that new Italian place downtown.", sender: 'other' },
                { text: "Sounds perfect! What time?", sender: 'me' },
                { text: "How about 7:30 PM?", sender: 'other' },
                { text: "See you then! ✨", sender: 'me' },
            ];

            let delay = 1000;
            let timeouts: ReturnType<typeof setTimeout>[] = [];

            messages.forEach((message, index) => {
                const timeoutId = setTimeout(() => {
                    const bubble = document.createElement('div');
                    bubble.classList.add('chat-bubble', 'p-3', 'rounded-lg', 'max-w-xs', 'text-sm');

                    if (message.sender === 'me') {
                        bubble.classList.add('bg-indigo-500', 'text-white', 'self-end', 'rounded-br-none');
                    } else {
                        bubble.classList.add('bg-gray-200', 'text-gray-800', 'self-start', 'rounded-bl-none');
                    }

                    bubble.textContent = message.text;
                    chatWindow.appendChild(bubble);
                    chatWindow.scrollTop = chatWindow.scrollHeight;

                    setTimeout(() => {
                        bubble.classList.add('show');
                    }, 10);

                }, delay * (index + 1));
                timeouts.push(timeoutId);
            });
        }

        const fadeInSections = document.querySelectorAll('.fade-in-section');
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeInSections.forEach(section => {
            observer.observe(section);
        });

        return () => {
            if (observer) {
                observer.disconnect();
            }
        };

    }, []);

    return (
        <>
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>ConnectSphere - The Future of Messaging</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
            </head>

            <style>
                {`
                    body {
                        font-family: 'Inter', sans-serif;
                        background-color: #f9fafb; /* bg-gray-50 */
                        color: #1f2937; /* text-gray-800 */
                    }
                    .hero-bg {
                        background-image: url('https://www.transparenttextures.com/patterns/cubes.png'), linear-gradient(to right top, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1);
                        background-color: #667eea;
                    }
                    .chat-bubble {
                        opacity: 0;
                        transform: translateY(20px);
                        transition: opacity 0.5s ease, transform 0.5s ease;
                    }
                    .chat-bubble.show {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .feature-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    }
                    
                    /* Fade-in animation styles */
                    .fade-in-section {
                        opacity: 0;
                        transform: translateY(20px);
                        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                    }
                    
                    .fade-in-section.is-visible {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    
                    /* Testimonial card styles */
                    .testimonial-card {
                        background: white;
                        border-radius: 1rem;
                        padding: 2rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    }
                    
                    /* Marquee animation */
                    @keyframes marquee {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-50%);
                        }
                    }
                    
                    .animate-marquee {
                        animation: marquee 30s linear infinite;
                    }
                `}
            </style>

            <div className="bg-gray-50 text-gray-800">
                <header className="absolute top-0 left-0 right-0 z-10 p-4">
                    <div className="container mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">ConnectSphere</h1>
                        <nav className="hidden md:flex space-x-8">
                            <a href="#features" className="text-white hover:text-indigo-200 transition">Features</a>
                            <a href="#why-us" className="text-white hover:text-indigo-200 transition">Why Us</a>
                            <a href="#cta" className="text-white hover:text-indigo-200 transition">Download</a>
                        </nav>
                        <button className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-indigo-50 transition">
                            Login
                        </button>
                    </div>
                </header>

                <section className="hero-bg relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0">
                    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                        <div className="w-full md:w-1/2 text-center md:text-left mb-12 md:mb-0">
                            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
                                Conversations that <br /> bring you closer.
                            </h2>
                            <p className="text-lg text-indigo-100 mb-8 max-w-lg mx-auto md:mx-0">
                                Seamless, secure, and simple. ConnectSphere is the free messaging app that keeps you connected to the people who matter most.
                            </p>
                            <a href="#cta" className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-100 transition transform hover:scale-105">
                                Get Started
                            </a>
                        </div>

                        <div className="w-full md:w-1/2 flex justify-center">
                            <div className="w-full max-w-sm bg-white/20 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/30">
                                <div className="bg-white rounded-xl p-4 h-96 flex flex-col space-y-3 overflow-hidden" id="chat-window">
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="py-16 fade-in-section">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                          <BlurText
                            text="Everything You Need to Connect"
                            delay={150}
                            animateBy="words"
                            direction="top"
                            className="text-3xl md:text-4xl font-bold text-gray-900"
                          />
                            <p className="text-gray-600 mt-2">And nothing you don't.</p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center mb-12">
                            <div className="w-full md:w-1/2 p-4">
                                <img src="https://placehold.co/600x400/9a9ae1/ffffff?text=Group+Chat" alt="Group Chat Illustration" className="rounded-lg shadow-xl" />
                            </div>
                            <div className="w-full md:w-1/2 px-6">
                                <h4 className="text-2xl font-bold mb-3">Stay in sync with your crew</h4>
                                <p className="text-gray-600">
                                    From planning a trip to sharing daily moments, group chats make it easy to stay connected with family, friends, and colleagues. Create groups for any occasion.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: File Sharing */}
                        <div className="flex flex-col md:flex-row-reverse items-center mb-12">
                            <div className="w-full md:w-1/2 p-4">
                                <img src="https://placehold.co/600x400/69bff8/ffffff?text=File+Sharing" alt="File Sharing Illustration" className="rounded-lg shadow-xl" />
                            </div>
                            <div className="w-full md:w-1/2 px-6">
                                <h4 className="text-2xl font-bold mb-3">Share files, photos, and more</h4>
                                <p className="text-gray-600">
                                    Send documents, videos, and high-resolution photos without compromising on quality. Sharing important files and precious memories has never been easier or faster.
                                </p>
                            </div>
                        </div>
                        
                        {/* Feature 3: End-to-End Encryption */}
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="w-full md:w-1/2 p-4">
                                <img src="https://placehold.co/600x400/d16ba5/ffffff?text=Secure" alt="Security Illustration" className="rounded-lg shadow-xl" />
                            </div>
                            <div className="w-full md:w-1/2 px-6">
                                <h4 className="text-2xl font-bold mb-3">Your privacy, protected</h4>
                                <p className="text-gray-600">
                                    With state-of-the-art end-to-end encryption, your personal messages and calls are secure. Only you and the person you're communicating with can read or listen to them, nobody in between.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cross-Platform Sync Section */}
                <section id="cross-platform" className="py-16 bg-white fade-in-section">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row-reverse items-center">
                            <div className="w-full md:w-1/2 p-4">
                                <img src="https://placehold.co/600x400/8aa7ec/ffffff?text=Cross-Platform+Sync" alt="Cross-Platform Sync Illustration" className="rounded-lg shadow-xl" />
                            </div>
                            <div className="w-full md:w-1/2 px-6">
                                <h4 className="text-2xl font-bold mb-3">Available on All Your Devices</h4>
                                <p className="text-gray-600">
                                    Start a conversation on your phone and seamlessly continue it on your tablet or desktop. Your messages are always in sync, no matter where you are.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us Section */}
                <section id="why-us" className="bg-gray-100 py-20 fade-in-section">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Why ConnectSphere?</h3>
                            <p className="text-gray-600 mt-2">The clear choice for clear communication.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <div className="bg-white p-8 rounded-lg shadow-md text-center feature-card transition-all duration-300">
                                <div className="bg-indigo-100 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <h4 className="text-xl font-bold mb-2">Blazing Fast</h4>
                                <p className="text-gray-600">Messages are delivered instantly, even on slow networks. Experience real-time communication without the lag.</p>
                            </div>
                            {/* Card 2 */}
                            <div className="bg-white p-8 rounded-lg shadow-md text-center feature-card transition-all duration-300">
                                <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <h4 className="text-xl font-bold mb-2">Ironclad Security</h4>
                                <p className="text-gray-600">We take your privacy seriously. Your data is yours alone, protected by the most robust security protocols.</p>
                            </div>
                            {/* Card 3 */}
                            <div className="bg-white p-8 rounded-lg shadow-md text-center feature-card transition-all duration-300">
                                <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2 1M4 7l2-1M4 7v2.5M12 21.5v-2.5M12 18.5l-2 1m2-1l2 1" /></svg>
                                </div>
                                <h4 className="text-xl font-bold mb-2">Clean & Intuitive</h4>
                                <p className="text-gray-600">A beautiful, clutter-free interface that's easy to navigate from day one. Communication should be simple.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="bg-white fade-in-section py-12 border-t border-gray-200">
                    <div className="container mx-auto px-6 text-center mb-8">
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Loved by Users Worldwide</h3>
                        <p className="text-gray-600 mt-2">What people are saying about ConnectSphere</p>
                    </div>

                    {/* Marquee wrapper */}
                    <div className="overflow-hidden relative">
                        <div className="flex space-x-8 animate-marquee">
                            {/* Set 1 */}
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"Amazing app! Super smooth and secure."</p>
                                <p className="mt-3 font-bold">– Alex P.</p>
                            </div>
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"I use it daily with my team, love the UI."</p>
                                <p className="mt-3 font-bold">– Priya K.</p>
                            </div>
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"Best chat experience I've had so far."</p>
                                <p className="mt-3 font-bold">– Daniel R.</p>
                            </div>
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"Simple, clean, and secure. Perfect."</p>
                                <p className="mt-3 font-bold">– Sarah L.</p>
                            </div>
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"Finally, a messaging app I can trust!"</p>
                                <p className="mt-3 font-bold">– Miguel S.</p>
                            </div>

                            {/* Duplicate set for seamless loop */}
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"Amazing app! Super smooth and secure."</p>
                                <p className="mt-3 font-bold">– Alex P.</p>
                            </div>
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"I use it daily with my team, love the UI."</p>
                                <p className="mt-3 font-bold">– Priya K.</p>
                            </div>
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"Best chat experience I've had so far."</p>
                                <p className="mt-3 font-bold">– Daniel R.</p>
                            </div>
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"Simple, clean, and secure. Perfect."</p>
                                <p className="mt-3 font-bold">– Sarah L.</p>
                            </div>
                            <div className="testimonial-card w-80 flex-shrink-0">
                                <p className="italic text-gray-600">"Finally, a messaging app I can trust!"</p>
                                <p className="mt-3 font-bold">– Miguel S.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section id="cta" className="bg-indigo-600 fade-in-section">
                    <div className="container mx-auto px-6 py-20 text-center">
                        <h3 className="text-3xl md:text-4xl font-bold text-white">Ready to Start Connecting?</h3>
                        <p className="text-indigo-200 mt-2 mb-8">Download ConnectSphere today and join the conversation.</p>
                        <div className="flex justify-center space-x-4">
                            <a href="#" className="bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.36,10.39a.88.88,0,0,0-.68-.89l-4-1.12a.89.89,0,0,0-1,.65.88.88,0,0,0,.65,1l2.53.71-3.6,3.6a.88.88,0,0,0,1.24,1.24l3.6-3.6.71,2.53a.88.88,0,0,0,1,.65.83.83,0,0,0,.2-.05.88.88,0,0,0,.45-1.15ZM12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/></svg>
                                <span>Download for iOS</span>
                            </a>
                            <a href="#" className="bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.3,7.13a.88.88,0,0,0-.8-.53H15.7a.89.89,0,0,0-.89.89v5.4a.89.89,0,0,0,.89.89h2.8a.88.88,0,0,0,.8-.53l1.2-2.7a.88.88,0,0,0,0-.92ZM17.1,12H16.6V9h.5l.6,1.5ZM9.9,13.88a.88.88,0,0,0,1.4.8l2.3-2.3V8.58a.88.88,0,0,0-1.5-.6L9.9,8.18ZM4.7,13.28l2.3,2.3a.88.88,0,0,0,1.4-.8V7.42a.88.88,0,0,0-1.4-.8L4.7,8.92a.88.88,0,0,0,0,1.24Z"/></svg>
                                <span>Download for Android</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-800 text-white py-8">
                    <div className="container mx-auto px-6 text-center">
                        <p>&copy; 2024 ConnectSphere. All rights reserved.</p>
                        <div className="flex justify-center space-x-6 mt-4">
                            <a href="#" className="hover:text-indigo-400">Privacy Policy</a>
                            <a href="#" className="hover:text-indigo-400">Terms of Service</a>
                            <a href="#" className="hover:text-indigo-400">Contact</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default ConnectSpherePage;
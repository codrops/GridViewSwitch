import { preloadImages } from './utils.js';

// Grid element
const grid = document.querySelector('.columns');

// The grid columns iiner elements that move upwards/downwards
const columnsInner = {
    up: grid.querySelectorAll('.column--moveup > .column-inner'),
    down: grid.querySelectorAll('.column--movedown > .column-inner')
};

// Content element
const content = document.querySelector('.content');

// Content item element
const contentItem = content.querySelector('.content__item')

// Content nav and content nav items
const contentNav = content.querySelector('.content__nav');
const contentNavItems = contentNav.querySelectorAll('.content__nav-item');

// Content title and both title spans
const contentTitle = content.querySelector('.content__title');
const contentTitleWords = contentTitle.querySelectorAll('.oh > span');

// Element that "flips" (GSAP Flip). This element will be inserted in the contentItem.
const flipItem = grid.querySelector('.flip');

// Also its parent
const flipItemParent = flipItem.parentNode;

// The element on the left of the flipItem (when there are only two visible grid items in the viewport)
const pushItem = grid.querySelector('.push');

// There are two modes: grid mode and list mode
const switchMode = document.querySelector('.switch');

const switchToggle = {
    list: switchMode.querySelector('.switch__button--list'),
    grid: switchMode.querySelector('.switch__button--grid')
};

// We start with the grid mode by default
let currentMode = 'grid';
switchToggle[currentMode].classList.add('switch__button--current');

let isAnimating;

gsap.set([grid, columnsInner.up, columnsInner.down, contentTitleWords, pushItem, flipItem, contentNavItems], {willChange: 'transform, opacity'});

// Toggle function
const toggleMode = mode => {
    if ( isAnimating || currentMode === mode ) return;
    isAnimating = true;
    // Switch current state/class
    switchToggle[currentMode].classList.remove('switch__button--current');
    switchToggle[mode].classList.add('switch__button--current');
    // Set new mode
    currentMode = mode;
    // Call showList or showGrid functions
    switchActions[currentMode]().then(() => isAnimating = false);
};

// Show list mode
const showList = () => {
    return gsap
    .timeline({
        defaults: {
            duration: 1.7,
            ease: 'power2.inOut'
        },
        onStart: () => {
            // pointer events to auto
            content.classList.add('content--current');
        }
    })
    .addLabel('start', 0)
    .fromTo(grid, {
        scale: 0.4
    }, {
        scale: 1
    }, 'start')
    .to(columnsInner.up, {
        y: '-200vh'
    }, 'start')
    .to(columnsInner.down, {
        y: '200vh'
    }, 'start')
    
    // At this point there are only two items/images (flip and push items) in the viewport
    .addLabel('flip', 1.7)

    // contentTitle motion:
    // First show contentTitle
    .add(() => {
        gsap.set(contentTitle, {opacity: 1});
    }, 'flip-=1')
    // Now slide in each word/span
    .fromTo(contentTitleWords, {
        yPercent: pos => pos ? -200 : 200
    }, {
        duration: 0.85,
        ease: 'power2',
        yPercent: 0
    }, 'start+=0.85')
    // Then switch positions of both words
    .to([...contentTitleWords].map(word => word.parentNode), {
        duration: 1,
        ease: 'power4',
        yPercent: pos => pos ? -43 : 43
    })
    
    .add(() => {
        // Save current state of the flipItem
        const flipstate = Flip.getState(flipItem);
        // Insert the flipItem in the contentItem
        contentItem.appendChild(flipItem);
        // Animate the element using the GSAP Flip magic
        Flip.from(flipstate, {
            duration: 1,
            ease: 'power4'
        });
        // show contentNav
        gsap.set(contentNav, {opacity: 1});
    }, 'flip')
    .to(pushItem, {
        duration: 1,
        ease: 'power4',
        xPercent: -100,
        //startAt: {filter: 'brightness(100%)'},
        //filter: 'brightness(60%)'
    }, 'flip')
    .fromTo(contentNavItems, {
        yPercent: 200,
        opacity: 0
    }, {
        duration: .7,
        ease: 'power4',
        stagger: 0.03,
        yPercent: 0,
        opacity: 1
    }, 'flip')
};

// Show grid mode
const showGrid = () => {
    return gsap
    .timeline({
        defaults: {
            duration: 1.7,
            ease: 'power2.inOut'
        },
        onStart: () => {
            // pointer events to none
            content.classList.remove('content--current');
        }
    })
    .addLabel('flip', 0)
    .to(contentNavItems, {
        duration: .7,
        stagger: -0.03,
        yPercent: 200,
        opacity: 0,
        onComplete: () => {
            // hide contentNav
            gsap.set(contentNav, {opacity: 1});
        }
    }, 'flip')
    .to(pushItem, {
        duration: 1,
        xPercent: 0
    }, 'flip')
    .add(() => {
        // Save current state of the flipItem
        const flipstate = Flip.getState(flipItem);
        // Insert the flipItem in the original flipItemParent
        flipItemParent.appendChild(flipItem);
        // Animate the element using the GSAP Flip magic
        Flip.from(flipstate, {
            duration: 1,
            ease: 'power2.inOut',
        });
    }, 'flip')

    .addLabel('columns', 1)
    
    // contentTitle motion:
    .to([...contentTitleWords].map(word => word.parentNode), {
        duration: 1,
        yPercent: 0
    }, 'flip')
    // Now slide out each word/span
    .to(contentTitleWords, {
        duration: 0.85,
        yPercent: pos => pos ? -200 : 200,
        onComplete: () => gsap.set(contentTitle, {opacity: 0})
    }, 'columns')

    .to([columnsInner.down, columnsInner.up], {  
        y: 0
    }, 'columns')
    .to(grid, {     
        scale: 0.4
    }, 'columns')
};

const switchActions = {
    list: showList,
    grid: showGrid
};

// Toggle mode events
switchToggle.list.addEventListener('click', () => toggleMode('list'));
switchToggle.grid.addEventListener('click', () => toggleMode('grid'));

// Preload images then remove loader (loading class) from body
preloadImages('.column__item-img').then(() => document.body.classList.remove('loading'));
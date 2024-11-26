// Data for emojis categorized
const emojiData = {
  activiteiten: [
    '🏃‍♂️', '🏃‍♀️', '🏊‍♂️', '🏊‍♀️', '🚴‍♂️', '🚴‍♀️', '🧘‍♂️', '🧘‍♀️', '🎨', '🎭', '🎤', '🎧',
    '🎼', '🎹', '🥁', '🎸', '🎻', '🎲', '🎯', '🎳', '⚽', '🏀', '🏈', '🎾', '🏐', '🏓', '🏸'
  ],
  auto: [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛻'
  ],
  yoga: [
    '🧘', '🧘‍♂️', '🧘‍♀️', '🕉️', '☮️', '🧎', '🧎‍♂️', '🧎‍♀️', '🙏', '🕊️'
  ],
  winkelen: [
    '🛒', '🛍️', '💳', '💰', '🏪', '🎁', '🏬', '🎀', '💸', '🛍️'
  ],
  // Add more categories and emojis as needed
};

// List of category names
let categories = Object.keys(emojiData);
let currentCategoryIndex = 0;

// Variables for drag-and-drop functionality
let draggedEmoji = null;
let draggedEmojiClone = null;
let currentDroppable = null;

// Error Logging Function
function logError(eventType, message, details = {}) {
  console.error(`Error [${eventType}]: ${message}`, details);
}

// Load emojis into the emoji grid
function loadEmojis(category) {
  try {
    const emojiGrid = document.getElementById('emoji-grid');
    emojiGrid.innerHTML = ''; // Clear existing emojis
    const emojis = emojiData[category];

    // Create and append emoji items
    emojis.forEach(emojiChar => {
      const emojiItem = createEmojiItem(emojiChar);
      emojiGrid.appendChild(emojiItem);
    });

    // Update the category name display
    const categoryNameDisplay = document.getElementById('category-name');
    categoryNameDisplay.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  } catch (error) {
    logError('loadEmojis', 'Failed to load emojis for category.', { category, error });
  }
}

// Create an emoji item element
function createEmojiItem(emojiChar) {
  const emojiItem = document.createElement('div');
  emojiItem.classList.add('emoji-item');
  emojiItem.textContent = emojiChar;

  // Make the emoji draggable
  emojiItem.setAttribute('draggable', 'true');

  // Touch event listeners for drag-and-drop
  emojiItem.addEventListener('touchstart', handleDragStart, false);
  emojiItem.addEventListener('touchmove', handleDragMove, false);
  emojiItem.addEventListener('touchend', handleDragEnd, false);

  // Mouse event listeners for desktop
  emojiItem.addEventListener('mousedown', handleMouseDown, false);

  return emojiItem;
}

// Handle navigation between categories
function navigateCategory(direction) {
  try {
    if (direction === 'prev') {
      currentCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
    } else if (direction === 'next') {
      currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    }
    const newCategory = categories[currentCategoryIndex];
    loadEmojis(newCategory);
  } catch (error) {
    logError('navigateCategory', 'Failed to navigate categories.', { direction, error });
  }
}

// Event listeners for navigation buttons
document.getElementById('prev-category').addEventListener('click', () => navigateCategory('prev'));
document.getElementById('next-category').addEventListener('click', () => navigateCategory('next'));

// Drag-and-Drop Handlers for Touch Devices
function handleDragStart(e) {
  try {
    e.preventDefault();
    e.stopPropagation();
    draggedEmoji = e.target;
    draggedEmojiClone = draggedEmoji.cloneNode(true);
    draggedEmojiClone.classList.add('dragging-clone');
    document.body.appendChild(draggedEmojiClone);

    // Position the clone at the touch point
    const touch = e.touches[0];
    updateDraggedEmojiPosition(touch);

    // Initialize auto-scrolling
    initAutoScroll();
  } catch (error) {
    logError('handleDragStart', 'Failed during drag start.', { error });
  }
}

function handleDragMove(e) {
  try {
    if (!draggedEmojiClone) return;

    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    updateDraggedEmojiPosition(touch);

    // Get the element under the touch point
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elementBelow) return;

    const droppableBelow = elementBelow.closest('.emoji-placeholder');

    if (currentDroppable !== droppableBelow) {
      if (currentDroppable) {
        currentDroppable.classList.remove('highlight');
      }
      currentDroppable = droppableBelow;
      if (currentDroppable) {
        currentDroppable.classList.add('highlight');
      }
    }

    // Auto-scroll when near the edge
    autoScroll(touch.clientY);
  } catch (error) {
    logError('handleDragMove', 'Failed during drag move.', { error });
  }
}

function handleDragEnd(e) {
  try {
    if (!draggedEmojiClone) return;

    e.preventDefault();
    e.stopPropagation();
    draggedEmojiClone.remove();
    draggedEmojiClone = null;

    if (currentDroppable) {
      // Snap the emoji to the center of the placeholder
      currentDroppable.textContent = draggedEmoji.textContent;
      currentDroppable.classList.remove('highlight');
    }

    draggedEmoji = null;
    currentDroppable = null;

    // Stop auto-scrolling
    stopAutoScroll();
  } catch (error) {
    logError('handleDragEnd', 'Failed during drag end.', { error });
  }
}

// Mouse Event Handlers for Desktop Support
function handleMouseDown(e) {
  try {
    e.preventDefault();
    e.stopPropagation();
    draggedEmoji = e.target;
    draggedEmojiClone = draggedEmoji.cloneNode(true);
    draggedEmojiClone.classList.add('dragging-clone');
    document.body.appendChild(draggedEmojiClone);

    // Position the clone at the mouse point
    updateDraggedEmojiPosition(e);

    // Initialize auto-scrolling
    initAutoScroll();

    // Mouse move and up handlers
    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mouseup', handleMouseUp, false);
  } catch (error) {
    logError('handleMouseDown', 'Failed during mouse down.', { error });
  }
}

function handleMouseMove(e) {
  try {
    if (!draggedEmojiClone) return;

    e.preventDefault();
    e.stopPropagation();
    updateDraggedEmojiPosition(e);

    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    if (!elementBelow) return;

    const droppableBelow = elementBelow.closest('.emoji-placeholder');

    if (currentDroppable !== droppableBelow) {
      if (currentDroppable) {
        currentDroppable.classList.remove('highlight');
      }
      currentDroppable = droppableBelow;
      if (currentDroppable) {
        currentDroppable.classList.add('highlight');
      }
    }

    // Auto-scroll when near the edge
    autoScroll(e.clientY);
  } catch (error) {
    logError('handleMouseMove', 'Failed during mouse move.', { error });
  }
}

function handleMouseUp(e) {
  try {
    if (!draggedEmojiClone) return;

    e.preventDefault();
    e.stopPropagation();
    draggedEmojiClone.remove();
    draggedEmojiClone = null;

    if (currentDroppable) {
      // Snap the emoji to the center of the placeholder
      currentDroppable.textContent = draggedEmoji.textContent;
      currentDroppable.classList.remove('highlight');
    }

    draggedEmoji = null;
    currentDroppable = null;

    // Stop auto-scrolling
    stopAutoScroll();

    document.removeEventListener('mousemove', handleMouseMove, false);
    document.removeEventListener('mouseup', handleMouseUp, false);
  } catch (error) {
    logError('handleMouseUp', 'Failed during mouse up.', { error });
  }
}

// Update the position of the dragged emoji clone
function updateDraggedEmojiPosition(event) {
  try {
    const x = event.clientX || (event.touches && event.touches[0].clientX);
    const y = event.clientY || (event.touches && event.touches[0].clientY);
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Position the clone under the cursor/finger
    draggedEmojiClone.style.left = `${x + scrollLeft}px`;
    draggedEmojiClone.style.top = `${y + scrollTop}px`;
    draggedEmojiClone.style.position = 'absolute';
    draggedEmojiClone.style.zIndex = 1000;
  } catch (error) {
    logError('updateDraggedEmojiPosition', 'Failed to update dragged emoji position.', { error });
  }
}

// Auto-scroll variables
let autoScrollInterval = null;
const scrollThreshold = 50; // Distance from edge in pixels
const scrollSpeed = 10; // Pixels per interval

// Initialize auto-scrolling
function initAutoScroll() {
  if (autoScrollInterval) return;
  autoScrollInterval = setInterval(() => {}, 20); // Placeholder, actual scrolling happens in autoScroll()
}

// Auto-scroll function
function autoScroll(pointerY) {
  const viewportHeight = window.innerHeight;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - viewportHeight;

  if (pointerY < scrollThreshold && scrollTop > 0) {
    // Scroll up
    window.scrollBy(0, -scrollSpeed);
  } else if (pointerY > viewportHeight - scrollThreshold && scrollTop < maxScroll) {
    // Scroll down
    window.scrollBy(0, scrollSpeed);
  }
}

// Stop auto-scrolling
function stopAutoScroll() {
  clearInterval(autoScrollInterval);
  autoScrollInterval = null;
}

// Huiswerk Button Toggle Functionality
const huiswerkButton = document.querySelector('.huiswerk-button');
huiswerkButton.addEventListener('click', () => {
  try {
    huiswerkButton.classList.toggle('active');

    if (huiswerkButton.classList.contains('active')) {
      // Add thumbs-up animation
      const thumbSpan = document.createElement('span');
      thumbSpan.textContent = '👍';
      thumbSpan.classList.add('thumb-animation');
      huiswerkButton.appendChild(thumbSpan);

      setTimeout(() => {
        thumbSpan.remove();
      }, 2000); // Remove after 2 seconds
    }
  } catch (error) {
    logError('huiswerkButton', 'Failed to toggle Huiswerk button.', { error });
  }
});

// Update live time display
function updateLiveTime() {
  try {
    const liveTimeElement = document.getElementById('live-time');
    const now = new Date();
    liveTimeElement.textContent = now.toLocaleTimeString();
  } catch (error) {
    logError('updateLiveTime', 'Failed to update live time.', { error });
  }
}

// Reset Button Functionality
document.getElementById('reset-button').addEventListener('click', () => {
  try {
    // Clear emojis from placeholders
    const placeholders = document.querySelectorAll('.emoji-placeholder');
    placeholders.forEach(placeholder => {
      placeholder.textContent = '';
    });

    // Reset Huiswerk button
    huiswerkButton.classList.remove('active');

    // Reset day rating
    ratingButtons.forEach(button => {
      button.classList.remove('selected');
    });
  } catch (error) {
    logError('resetButton', 'Failed to reset planner.', { error });
  }
});

// Day Rating System
const ratingButtons = document.querySelectorAll('.rating-button');
ratingButtons.forEach(button => {
  button.addEventListener('click', () => {
    try {
      ratingButtons.forEach(btn => {
        btn.classList.remove('selected');
      });
      button.classList.add('selected');
    } catch (error) {
      logError('ratingButton', 'Failed to select rating.', { button, error });
    }
  });
});

// Header Logo Flip Animation
window.addEventListener('load', () => {
  try {
    const headerLogo = document.getElementById('header-logo');
    headerLogo.classList.add('flip-animation');
    // Remove the animation class after it completes to prevent looping
    headerLogo.addEventListener('animationend', () => {
      headerLogo.classList.remove('flip-animation');
    });
  } catch (error) {
    logError('headerLogoAnimation', 'Failed to animate header logo.', { error });
  }
});

// How-To Overlay Screen Functionality
const howToOverlay = document.getElementById('how-to-overlay');
const howToSlides = document.querySelectorAll('.how-to-slide');
const howToDots = document.querySelectorAll('.how-to-dots .dot');
const howToCloseButton = document.getElementById('how-to-close');

let currentSlideIndex = 0;

// Show the initial slide
showSlide(currentSlideIndex);

// Swipe event listeners
let startX = 0;
howToOverlay.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
}, false);

howToOverlay.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) {
    // Swiped left
    nextSlide();
  } else if (endX - startX > 50) {
    // Swiped right
    prevSlide();
  }
}, false);

// Show the specified slide
function showSlide(index) {
  howToSlides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
    howToDots[i].classList.toggle('active', i === index);
  });
}

// Next slide
function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % howToSlides.length;
  showSlide(currentSlideIndex);
}

// Previous slide
function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + howToSlides.length) % howToSlides.length;
  showSlide(currentSlideIndex);
}

// Close the How-To Overlay
howToCloseButton.addEventListener('click', () => {
  howToOverlay.style.display = 'none';
});

// Initialize the application
function init() {
  try {
    // Load the default emoji category
    loadEmojis(categories[currentCategoryIndex]);

    // Update live time every second
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
  } catch (error) {
    logError('init', 'Failed to initialize the application.', { error });
  }
}

init();

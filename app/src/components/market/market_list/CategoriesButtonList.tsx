import React from 'react'

const CategoriesButtonList = ({ categories, currentCategory, onCategorySelect }) => {
  // Handler for button click
  const handleButtonClick = (categoryId) => {
    onCategorySelect(categoryId); // Use passed in function to set category
  }

  return (
    <div>
      <button
        style={{
          backgroundColor: currentCategory === 'All' ? '#007bff' : '#ffffff',
          color: currentCategory === 'All' ? '#ffffff' : '#000000',
        }}
        onClick={() => handleButtonClick('All')}
      >
        All Categories
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          style={{
            backgroundColor: currentCategory === category.id ? '#007bff' : '#ffffff',
            color: currentCategory === category.id ? '#ffffff' : '#000000',
          }}
          onClick={() => handleButtonClick(category.id)}
        >
          {category.id} {/* Assuming you want to display the category ID as the button text */}
        </button>
      ))}
    </div>
  )
}

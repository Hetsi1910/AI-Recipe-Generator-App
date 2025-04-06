import './App.css';
import React, { useEffect, useRef, useState } from "react";

const RecipeCard = ({ onSubmit }) => {
    const [ingredients, setIngredients] = useState("");
    const [mealType, setMealType] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [cookingTime, setCookingTime] = useState("");
    const [complexity, setComplexity] = useState("");

    const handleSubmit = () => {
        const recipeData = {
            ingredients,
            mealType,
            cuisine,
            cookingTime,
            complexity,
        };
        onSubmit(recipeData);
    };

    return (
        <div className="recipe-card">
            <div className="card-content">
                <h2 className="card-title">Recipe Generator</h2>

                <div className="form-group">
                    <label htmlFor="ingredients">Ingredients</label>
                    <input
                        className="small-input"
                        id="ingredients"
                        type="text"
                        placeholder="Enter ingredients"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="mealType">Meal Type</label>
                    <select
                        id="mealType"
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                    >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="cuisine">Cuisine Preference</label>
                    <input
                        className="small-input"
                        id="cuisine"
                        type="text"
                        placeholder="e.g., Italian, Mexican"
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="cookingTime">Cooking Time</label>
                    <select
                        id="cookingTime"
                        value={cookingTime}
                        onChange={(e) => setCookingTime(e.target.value)}
                    >
                        <option value="Less than 30 minutes">Less than 30 minutes</option>
                        <option value="30-60 minutes">30-60 minutes</option>
                        <option value="More than 1 hour">More than 1 hour</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="complexity">Complexity</label>
                    <select
                        id="complexity"
                        value={complexity}
                        onChange={(e) => setComplexity(e.target.value)}
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <button className="submit-btn" type="button" onClick={handleSubmit}>
                    Generate Recipe
                </button>
            </div>
        </div>
    );
};

function App() {
    const [recipeData, setRecipeData] = useState(null);
    const [recipeText, setRecipeText] = useState("");
    const eventSourceRef = useRef(null);

    useEffect(() => {
        if (recipeData) {
            closeEventStream();
            initializeEventStream();
        }
    }, [recipeData]);

    const initializeEventStream = () => {
        const recipeInputs = { ...recipeData };
        const queryParams = new URLSearchParams(recipeInputs).toString();
        const url = `http://localhost:3001/recipeStream?${queryParams}`;    //PORT

        eventSourceRef.current = new EventSource(url);

        eventSourceRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.action === "close") {
                closeEventStream();
            } else if (data.action === "chunk") {
                setRecipeText((prev) => prev + data.chunk);
            }
        };

        eventSourceRef.current.onerror = () => {
            eventSourceRef.current.close();
        };
    };

    const closeEventStream = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    };

    async function onSubmit(data) {
        setRecipeText('');
        setRecipeData(data);
    }

    return (
        <div className="App">
            <div className="container">
                <RecipeCard onSubmit={onSubmit} />
                <div className="recipe-display">
                    {recipeText}
                </div>
            </div>
        </div>
    );
}

export default App;

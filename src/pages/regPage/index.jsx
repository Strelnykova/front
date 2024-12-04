import React, { useState, useEffect } from "react";
import "./style.css";

export const RegistrationPage = () => {
    const [units, setUnits] = useState([]);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        unitId: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await fetch("http://localhost:4000/api/units/");
                if (response.ok) {
                    const data = await response.json();
                    setUnits(data);
                } else {
                    throw new Error("Не вдалося завантажити підрозділи");
                }
            } catch (err) {
                setError(err.message);
            }
        };
        fetchUnits();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData, role: "contractor" }),
            });

            if (response.ok) {
                window.location.href = "/login";
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Помилка реєстрації");
            }
        } catch (err) {
            setError("Не вдалося підключитися до сервера");
        }
    };

    return (
        <div className="container">
            <div className="screen">
                <div className="screen__content">
                    <form className="reg" onSubmit={handleSubmit}>
                        <div className="login__field">
                            <i className="login__icon fas fa-user"></i>
                            <input
                                type="text"
                                name="username"
                                className="login__input"
                                placeholder="Name"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login__field">
                            <i className="login__icon fas fa-lock"></i>
                            <input
                                type="password"
                                name="password"
                                className="login__input"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login__field">
                            <i className="login__icon fas fa-envelope"></i>
                            <input
                                type="email"
                                name="email"
                                className="login__input"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="login__field">
                            <i className="login__icon fas fa-sitemap"></i>
                            <select
                                name="unitId"
                                className="login__input"
                                value={formData.unitId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Оберіть підрозділ</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button className="button login__submit">
                            <span className="button__text">Зареєструватися</span>
                            <i className="button__icon fas fa-chevron-right"></i>
                        </button>
                    </form>
                    <div className="social-login">
                        <h3><a href="/login">Увійти</a></h3>
                    </div>
                </div>
                <div className="screen__background">
                    <span className="screen__background__shape screen__background__shape4"></span>
                    <span className="screen__background__shape screen__background__shape3"></span>		
                    <span className="screen__background__shape screen__background__shape2"></span>
                    <span className="screen__background__shape screen__background__shape1"></span>
                </div>		
            </div>
        </div>
    );
};

import React, { useState, useEffect } from "react";
import { message } from "antd";
import "./style.css";
import { UsedResourcesTable } from "./components/usedResourcesTable";

export const Profile = () => {
    const [user, setUser] = useState({
        id: "",
        username: "",
        email: "",
        role: "",
        password: "",
        unitId: ""
    });

    const [errors, setErrors] = useState({
        username: null,
        email: null,
    });

    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const authUser = localStorage.getItem("authUser");
            if (authUser) {
                try {
                    const parsedUser = JSON.parse(authUser);
                    setUser({
                        id: parsedUser.id,
                        username: parsedUser.username,
                        email: parsedUser.email,
                        password: "", 
                        role: parsedUser.role,
                        unitId: parsedUser.unitId
                    });
                } catch (error) {
                    console.error("Помилка парсингу authUser:", error);
                }
            }
        };
        fetchUser();
    }, []);

    const checkAvailability = async (field, value) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ [field]: value }),
            });

            const data = await response.json();

            if (data.exists) {
                setErrors((prev) => ({ ...prev, [field]: `${field} зайнятий` }));
            } else {
                setErrors((prev) => ({ ...prev, [field]: null }));
            }
        } catch (error) {
            console.error(`Помилка перевірки ${field}:`, error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));

        if (name === "username" || name === "email") {
            checkAvailability(name, value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!errors.username && !errors.email) {
            let updatedUser = { ...user };

            if (user.password) {
                updatedUser.password = user.password;
            }

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${user.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedUser),
                });

                if (response.ok) {
                    setSuccess("Дані успішно оновлено!");
                    message.success("Дані успішно оновлено!!");
                    localStorage.setItem("authUser", JSON.stringify(updatedUser));
                } else {
                    setSuccess("Сталася помилка при оновленні профілю.");
                }
            } catch (error) {
                console.error("Помилка оновлення профілю:", error);
            }
        }
    };

    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('authUser'));
        if (user) {
        setUserRole(user.role);
        }
    }, []);

    return (
        <>
            <div className="profile-container">
                <h1>Профіль</h1>
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label>Ім'я користувача</label>
                        <input
                            type="text"
                            name="username"
                            value={user.username}
                            onChange={handleInputChange}
                            className={errors.username ? "input-error" : ""}
                            placeholder="Введіть ім'я"
                        />
                        {errors.username && <span className="error">{errors.username}</span>}
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleInputChange}
                            className={errors.email ? "input-error" : ""}
                            placeholder="Введіть email"
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label>Новий пароль</label>
                        <input
                            type="password"
                            name="password"
                            value={user.password}
                            onChange={handleInputChange}
                            placeholder="Введіть пароль"
                        />
                    </div>
                    <button type="submit" className="btn">
                        Оновити профіль
                    </button>
                    {success && <p className="success">{success}</p>}
                </form>
            </div>

            <>
                {userRole !== "admin" && <UsedResourcesTable />}
            </>
        </>
    );
};

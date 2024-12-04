import React, { useState } from "react";
import "./style.css";
import { Profile } from "./components/profile/index";
import { ViewResources } from "./components/viewResources";
import { RegisterResources } from "./components/registerResources";
import { ResourceList } from "./components/resourceList";
import { UseResources } from "./components/useResources";

export const HomePage = () => {
    const [activeComponent, setActiveComponent] = useState("profile");
    const user = JSON.parse(localStorage.getItem("authUser"));

    const renderComponent = () => {
        switch (activeComponent) {
            case "register":
                return <RegisterResources />;
            case "use":
                return <UseResources />;
            case "list":
                return <ResourceList />;
            case "view":
                return <ViewResources />;
            case "profile":
                return <Profile />;
            case "logout":
                return window.location.href = "/logout";
            default:
                return <Profile />;
        }
    };

    return (
        <div className="home__container">
            <nav className="navbar">
                <div className="navbar__brand">Management System</div>
                <ul className="navbar__links">
                    {user.role === "admin" && (
                        <li onClick={() => setActiveComponent("register")}>
                            Зареєструвати ресурси
                        </li>
                    )}
                    {user.role !== "admin" && (
                        <li onClick={() => setActiveComponent("use")}>
                            Використати ресурси
                        </li>
                    )}
                    <li onClick={() => setActiveComponent("list")}>
                        Наявні ресурси
                    </li>
                    <li onClick={() => setActiveComponent("view")}>
                        Переглянути використані ресурси
                    </li>
                    <li onClick={() => setActiveComponent("profile")}>
                        Профіль
                    </li>
                    <li onClick={() => setActiveComponent("logout")}>
                        Вихід
                    </li>
                </ul>
            </nav>
            <main className="main-content">{renderComponent()}</main>
        </div>
    );
};

import { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";

import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from "chart.js";

import "./App.css";

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

function App() {

    const [activities, setActivities] = useState([]);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {

        try {

            const response = await axios.get(
                "http://localhost:5000/api/activity"
            );

            setActivities(response.data);

        } catch (error) {

            console.error(
                "Error fetching activities:",
                error
            );

        }

    };

    // Calculate overall time

    const productiveTime = activities
        .filter(activity => activity.category === "Productive")
        .reduce(
            (total, activity) => total + activity.duration,
            0
        );

    const unproductiveTime = activities
        .filter(activity => activity.category === "Unproductive")
        .reduce(
            (total, activity) => total + activity.duration,
            0
        );

    const neutralTime = activities
        .filter(activity => activity.category === "Neutral")
        .reduce(
            (total, activity) => total + activity.duration,
            0
        );

    const totalTime =
        productiveTime +
        unproductiveTime +
        neutralTime;


    // Calculate website usage

    const websiteUsage = {};

    activities.forEach(activity => {

        if (websiteUsage[activity.website]) {

            websiteUsage[activity.website] +=
                activity.duration;

        } else {

            websiteUsage[activity.website] =
                activity.duration;

        }

    });


    const websiteLabels =
        Object.keys(websiteUsage);

    const websiteDurations =
        Object.values(websiteUsage);


    // Website bar chart

    const websiteChartData = {

        labels: websiteLabels,

        datasets: [
            {
                label: "Time Spent (seconds)",

                data: websiteDurations,

                backgroundColor: "#4f46e5",

                borderWidth: 1
            }
        ]

    };


    // Top 5 websites

    const topWebsites = Object.entries(websiteUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);


    // Weekly activity

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7
    );


    const weeklyActivities =
        activities.filter(activity => {

            return new Date(activity.timestamp)
                >= sevenDaysAgo;

        });


    const weeklyProductiveTime =
        weeklyActivities
            .filter(
                activity =>
                    activity.category === "Productive"
            )
            .reduce(
                (total, activity) =>
                    total + activity.duration,
                0
            );


    const weeklyUnproductiveTime =
        weeklyActivities
            .filter(
                activity =>
                    activity.category === "Unproductive"
            )
            .reduce(
                (total, activity) =>
                    total + activity.duration,
                0
            );


    const weeklyNeutralTime =
        weeklyActivities
            .filter(
                activity =>
                    activity.category === "Neutral"
            )
            .reduce(
                (total, activity) =>
                    total + activity.duration,
                0
            );


    const weeklyTotalTime =
        weeklyProductiveTime +
        weeklyUnproductiveTime +
        weeklyNeutralTime;

        // Weekly chart data

const weeklyChartData = {
    labels: ["Productive", "Unproductive", "Neutral"],

    datasets: [
        {
            label: "Weekly Time (seconds)",

            data: [
                weeklyProductiveTime,
                weeklyUnproductiveTime,
                weeklyNeutralTime
            ],

            backgroundColor: [
                "#16803c",
                "#d93025",
                "#e69500"
            ],

            borderWidth: 1
        }
    ]
};


    // Weekly productivity percentage

    const weeklyProductivityPercentage =
        weeklyTotalTime > 0
            ? Math.round(
                (weeklyProductiveTime /
                    weeklyTotalTime) * 100
            )
            : 0;


    // Pie chart

    const chartData = {

        labels: [
            "Productive",
            "Unproductive",
            "Neutral"
        ],

        datasets: [
            {

                label: "Time Usage",

                data: [
                    productiveTime,
                    unproductiveTime,
                    neutralTime
                ],

                backgroundColor: [
                    "#16803c",
                    "#d93025",
                    "#e69500"
                ],

                borderWidth: 1

            }
        ]

    };


    // Format time

    const formatTime = (seconds) => {

        const minutes =
            Math.floor(seconds / 60);

        if (minutes < 60) {

            return `${minutes} min`;

        }

        const hours =
            Math.floor(minutes / 60);

        const remainingMinutes =
            minutes % 60;

        return `${hours}h ${remainingMinutes}m`;

    };


    return (

        <div className="dashboard">

            {/* Header */}

         <header>

    <h1>FocusTrack</h1>

    <p>
        Productivity Analytics Dashboard
    </p>

    <button onClick={fetchActivities}>
        🔄 Refresh Data
    </button>

</header>


            {/* Summary Cards */}

            <div className="cards">

                <div className="card">

                    <h3>Total Time</h3>

                    <h2>
                        {formatTime(totalTime)}
                    </h2>

                </div>


                <div className="card productive">

                    <h3>Productive</h3>

                    <h2>
                        {formatTime(productiveTime)}
                    </h2>

                </div>


                <div className="card unproductive">

                    <h3>Unproductive</h3>

                    <h2>
                        {formatTime(unproductiveTime)}
                    </h2>

                </div>


                <div className="card neutral">

                    <h3>Neutral</h3>

                    <h2>
                        {formatTime(neutralTime)}
                    </h2>

                </div>

            </div>


            {/* Productivity Pie Chart */}

            <div className="chart-section">

                <h2>
                    Productivity Overview
                </h2>

                <div className="chart-container">

                    <Pie data={chartData} />

                </div>

            </div>


            {/* Website Usage Bar Chart */}

            <div className="chart-section">

                <h2>
                    Website Usage
                </h2>

                <div className="bar-chart-container">

                    <Bar
                        data={websiteChartData}
                    />

                </div>

            </div>


            {/* Top Websites */}

            <div className="activity-section">

                <h2>
                    Top Websites
                </h2>

                <table>

                    <thead>

                        <tr>

                            <th>
                                Website
                            </th>

                            <th>
                                Time Spent
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {topWebsites.map(
                            ([website, duration]) => (

                                <tr key={website}>

                                    <td>
                                        {website}
                                    </td>

                                    <td>
                                        {formatTime(
                                            duration
                                        )}
                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>


            {/* Weekly Productivity */}

            <div className="chart-section">
                <div className="bar-chart-container">

    <Bar
        data={weeklyChartData}
    />

</div>

                <h2>
                    Weekly Productivity
                </h2>

                <div className="cards">

                    <div className="card">

                        <h3>
                            Total Weekly Time
                        </h3>

                        <h2>
                            {formatTime(
                                weeklyTotalTime
                            )}
                        </h2>

                    </div>


                    <div className="card productive">

                        <h3>
                            Productive
                        </h3>

                        <h2>
                            {formatTime(
                                weeklyProductiveTime
                            )}
                        </h2>

                    </div>


                    <div className="card unproductive">

                        <h3>
                            Unproductive
                        </h3>

                        <h2>
                            {formatTime(
                                weeklyUnproductiveTime
                            )}
                        </h2>

                    </div>


                    <div className="card neutral">

                        <h3>
                            Neutral
                        </h3>

                        <h2>
                            {formatTime(
                                weeklyNeutralTime
                            )}
                        </h2>

                    </div>


                    <div className="card">

                        <h3>
                            Productivity
                        </h3>

                        <h2>
                            {weeklyProductivityPercentage}%
                        </h2>

                    </div>

                </div>

            </div>


            {/* Recent Website Activity */}

            <div className="activity-section">

                <h2>
                    Recent Website Activity
                </h2>

                <table>

                    <thead>

                        <tr>

                            <th>
                                Website
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Duration
                            </th>

                            <th>
                                Time
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {activities.map(
                            (activity) => (

                                <tr
                                    key={
                                        activity._id
                                    }
                                >

                                    <td>
                                        {
                                            activity.website
                                        }
                                    </td>


                                    <td>

                                        <span
                                            className={
                                                activity
                                                    .category
                                                    .toLowerCase()
                                            }
                                        >
                                            {
                                                activity.category
                                            }
                                        </span>

                                    </td>


                                    <td>
                                        {formatTime(
                                            activity.duration
                                        )}
                                    </td>


                                    <td>

                                        {new Date(
                                            activity.timestamp
                                        ).toLocaleTimeString()}

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default App;
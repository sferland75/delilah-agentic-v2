import React from 'react';
import { Form1Assessment as Form1AssessmentType } from '../../../types/assessment';

interface Props {
    data?: Form1AssessmentType;
    onChange: (data: Form1AssessmentType) => void;
}

const DEFAULT_DATA: Form1AssessmentType = {
    attendantCare: {
        routinePersonalCare: {
            tasks: [],
            totalHours: 0
        },
        basicSupervisory: {
            tasks: [],
            totalHours: 0
        },
        complexHealth: {
            tasks: [],
            totalHours: 0
        }
    },
    monthlyCost: 0,
    levelOfCare: 'Level 1'
};

const HOURLY_RATE = 23.50; // Example rate, should be configurable

const Form1Assessment: React.FC<Props> = ({ data = DEFAULT_DATA, onChange }) => {
    const addTask = (category: keyof Form1AssessmentType['attendantCare']) => {
        const newTask = window.prompt(`Enter new ${category.replace(/([A-Z])/g, ' $1').toLowerCase()} task:`);
        const hours = parseFloat(window.prompt('Hours per week:') || '0');
        
        if (newTask && !isNaN(hours)) {
            const newTasks = [
                ...data.attendantCare[category].tasks,
                { task: newTask, hours }
            ];
            
            updateCategory(category, newTasks);
        }
    };

    const removeTask = (category: keyof Form1AssessmentType['attendantCare'], index: number) => {
        const newTasks = [...data.attendantCare[category].tasks];
        newTasks.splice(index, 1);
        updateCategory(category, newTasks);
    };

    const updateCategory = (category: keyof Form1AssessmentType['attendantCare'], tasks: Array<{task: string; hours: number}>) => {
        const totalHours = tasks.reduce((sum, task) => sum + task.hours, 0);
        
        const newData = {
            ...data,
            attendantCare: {
                ...data.attendantCare,
                [category]: {
                    tasks,
                    totalHours
                }
            }
        };

        // Calculate total monthly cost
        const totalWeeklyHours = Object.values(newData.attendantCare).reduce(
            (sum, category) => sum + category.totalHours,
            0
        );
        newData.monthlyCost = totalWeeklyHours * HOURLY_RATE * 52 / 12;

        // Determine level of care
        if (totalWeeklyHours > 40) {
            newData.levelOfCare = 'Level 3';
        } else if (totalWeeklyHours > 20) {
            newData.levelOfCare = 'Level 2';
        } else {
            newData.levelOfCare = 'Level 1';
        }

        onChange(newData);
    };

    const renderCategorySection = (category: keyof Form1AssessmentType['attendantCare'], title: string) => (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">{title}</h4>
                <span className="text-sm text-gray-500">
                    Total Hours: {data.attendantCare[category].totalHours.toFixed(1)} per week
                </span>
            </div>
            
            <div className="space-y-3">
                {data.attendantCare[category].tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex-grow">
                            <p className="text-sm font-medium text-gray-900">{task.task}</p>
                            <p className="text-sm text-gray-500">{task.hours} hours/week</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeTask(category, index)}
                            className="ml-4 text-red-600 hover:text-red-800"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                
                <button
                    type="button"
                    onClick={() => addTask(category)}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add Task
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Form 1 Assessment</h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                    <div>
                        <p className="text-sm text-gray-500">Monthly Cost</p>
                        <p className="text-lg font-medium text-gray-900">
                            ${data.monthlyCost.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Level of Care</p>
                        <p className="text-lg font-medium text-gray-900">
                            {data.levelOfCare}
                        </p>
                    </div>
                </div>
            </div>

            {renderCategorySection('routinePersonalCare', 'Routine Personal Care')}
            {renderCategorySection('basicSupervisory', 'Basic Supervisory Functions')}
            {renderCategorySection('complexHealth', 'Complex Health Care')}

            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-lg font-medium text-gray-900">Total Weekly Hours</h4>
                        <p className="text-sm text-gray-500">Combined across all categories</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {Object.values(data.attendantCare).reduce(
                            (sum, category) => sum + category.totalHours,
                            0
                        ).toFixed(1)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Form1Assessment;
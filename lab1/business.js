"use strict";

// const StudentService = (() => {
    const STORAGE_KEY = "students_simple_v1";

    const defaultStudents = [
        {
            id: 1,
            fullName: "Иванов Иван Иванович",
            group: "P3215",
            isuId: "367421",
            dormitory: 8,
            room: 412,
            settlementDate: "2027-06-30",
            isForeigner: false,
            notes: ""
        },
        {
            id: 2,
            fullName: "Ким Мин Джун",
            group: "M3402",
            isuId: "381905",
            dormitory: 5,
            room: 217,
            settlementDate: "2027-06-30",
            isForeigner: true,
            notes: "Иностранный студент"
        }
    ];

    function load() {
        const savedStudents = localStorage.getItem(STORAGE_KEY);
        return savedStudents ? JSON.parse(savedStudents) : defaultStudents;
    }

    function save(students) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }

    function findById(students, id) {
        return students.find((student) => student.id === id);
    }

    function add(students, studentData) {
        return [...students, { id: Date.now(), ...studentData }];
    }

    function update(students, id, studentData) {
        return students.map((student) => {
            return student.id === id ? { id, ...studentData } : student;
        });
    }

    function remove(students, id) {
        return students.filter((student) => student.id !== id);
    }

    function validate(student, students, currentId) {
        if (student.fullName.split(/\s+/).length < 2) {
            return { field: "fullName", message: "Введите фамилию и имя." };
        }

        const duplicateIsu = students.some((item) => {
            return item.isuId === student.isuId && item.id !== currentId;
        });

        if (duplicateIsu) {
            return {
                field: "isuId",
                message: "Студент с таким ИСУ ID уже существует."
            };
        }

        return null;
    }

//     return { load, save, findById, add, update, remove, validate };
// })();

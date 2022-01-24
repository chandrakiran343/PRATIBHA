import React, { useEffect, useState } from "react";
import Select from "react-select";
import Navbar from "../../../global_ui/navbar/navbar";
import Dialog from "../../../global_ui/dialog/dialog";
import { LoadingScreen } from "../../../global_ui/spinner/spinner";
import {
  getDepartments,
} from "../../services/facultyServices";
import "./lockList.css";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchSemNumber } from "../../../student/services/studentServices";

export default function AddClasses() {
    const [Course, setCourse] = useState({ value: "none" });
    const [Year, setYear] = useState({ value: 0 });
    const [Department, setDepartment] = useState("");
    const [Section, setSection] = useState("");
    const [Subject, setSubject] = useState("");
 
  
   const [disabledep, setdisabledep] = useState(true);
    const [disablesec, setdisablesec] = useState(true);
    const [disablesub, setdisablesub] = useState(true);
    const[disableadd,setdisableadd]=useState(true);
  
    const [showDialog, setShowDialog] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
  
    const [subjects, setSubjects] = useState([
      { value: "loading", label: "Loading..." },
    ]);
    const [departments, setDepartments] = useState([
      { value: "loading", label: "Loading..." },
    ]);
    const [sections, setSections] = useState([
      { value: "loading", label: "Loading..." },
    ]);
  

    const { currentUser } = useAuth();
    const nav = useNavigate();
    useEffect(() => {
      const getLables = async () => {
        try {
          const res = await getDepartments(Course.value, Year.value);
          if (!res) return;
          setSubjects(res.subjects);
          setDepartments(res.departments);
          setSections(res.sections);
        } catch (error) {
          console.log(error);
        }
      };
      getLables();
    }, [Course, Year]);

    const Courses = [
        { value: "BTech", label: "BTech" },
        { value: "MTech", label: "MTech" },
        { value: "MBA", label: "MBA" },
      ];
      const Years = [
        //fetch from db for the selected course
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
      ];
      const MYears = [
        //fetch from db for the selected course
        { value: "1", label: "1" },
        { value: "2", label: "2" },
      ];
    
     async function handleAddButton(){
          const sem = await fetchSemNumber("BTech","1")
          console.log(sem)
          console.log("added")
          setIsSuccess(true)
          setShowDialog("Class Added");
          setdisableadd(true);
          

      }

  return (
      <div>

<Navbar title={"Add any class"} backURL={currentUser.isHOD?"/faculty/hodclasslist":"/faculty/classlist"}/>
  
  <div className="addclasses-root">
  <p className="instruction">Select the class to be added.</p>
  {showDialog && (
            <Dialog
              message={showDialog}
              onOK={() => {
                isSuccess
                  ? currentUser.isHOD
                    ? nav(
                        "/faculty/hodclasslist",
                        { state: currentUser },
                        { replace: true }
                      )
                    : nav(
                        "/faculty/classlist",
                        { state: currentUser },
                        { replace: true }
                      )
                  : setShowDialog(false);
              }}
            />
          )}
      <div className="addclasses-dropdown">
              <p className="addclasses-dropdown-title">Course</p>
              <Select
                placeholder=""
                className="select-locklist"
                options={Courses}
                onChange={(selectedCourse) => {
                  setCourse(selectedCourse);
                }}
              />
              <p className="addclasses-dropdown-title">Year</p>
              <Select
                placeholder=""
                className="select-locklist"
                options={Course.value[0] === "M" ? MYears : Years}
                isDisabled={!Course}
                onChange={(selectedYear) => {
                  setYear(selectedYear);
                  setdisabledep(false);
                }}
              />
              <p className="addclasses-dropdown-title">Department</p>
              <Select
                placeholder=""
                options={departments}
                className="select-locklist"
                isDisabled={disabledep}
                onChange={(selectedDepartment) => {
                  setDepartment(selectedDepartment);
                  setdisablesec(false);
                  setSections((c) => {
                    return { ...c };
                  });
                }}
              />
              <p className="addclasses-dropdown-title">Section</p>
              <Select
                placeholder=""
                options={sections[Department.value]}
                className="select-locklist"
                isDisabled={disablesec}
                onChange={(selectedSection) => {
                  setSection(selectedSection);
                  setdisablesub(false);
                }}
              />
              <p className="addclasses-dropdown-title">Subject</p>
             
              <Select
                placeholder=""
                options={subjects[Department.value]}
                className="select-locklist"
                isDisabled={disablesub}
                onChange={(selectedSubject) => {
                  setSubject(selectedSubject);
                  setdisableadd(false);
                }}
              />
              <div className="addclasses-btn-div">

              <button
                className=" addclasses-btn normal"
                width="100"
                height="50"
                disabled={disableadd}
                onClick={handleAddButton}
              >
                <i className="fas fa-plus"></i>ADD
              </button>
              </div>
            </div>
  </div>
  </div>);
}
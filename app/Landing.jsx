'use client'

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import GitHubExplorer from "./newForm"

const semestersData = {
  "Semester 1": ["Lab 1: Programming in Python"],
  "Semester 3": ["Lab 1: Data Structures Lab", "Lab 2: Object-Oriented Programming Using JAVA"],
  "Semester 4": ["Lab 1: Digital Lab", "Lab 2: Operating Systems Lab"],
  "Semester 5": ["Lab 1: MicroProcesor Lab", "Lab 2: Database Management Systems Lab"],
  "Semester 6": ["Lab 1: Computer Networks Lab"],
  "Semester 7": ["Lab 1: Compiler Lab"],
}

const repoNames = {
  "Semester 1": {
    "Lab 1: Programming in Python": "KTUS1_Python_programming",
  },
  "Semester 3": {
    "Lab 1: Data Structures Lab": "dataStructures",
    "Lab 2: Object-Oriented Programming Using JAVA": "javaPrograms",
  },
  "Semester 4": {
    "Lab 1: Digital Lab": "KTUS4_Digital_Lab",
    "Lab 2: Operating Systems Lab": "oslab",
  },
  "Semester 5": {
    "Lab 1: MicroProcesor Lab": "ssmp-lab",
    "Lab 2: Database Management Systems Lab": "KTUS5_DBMS_Lab",
  },
  "Semester 6": {
    "Lab 1: Computer Networks Lab": "networkLabS6",
  },
  "Semester 7": {
    "Lab 1: Compiler Lab": "KTUS7_Compiler_design_lab",
  },
}

export default function SemesterLabExplorer() {
  const [semester, setSemester] = useState(null)
  const [lab, setLab] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleSemesterClick = (selectedSemester) => {
    setSemester(selectedSemester)
    setLab(null)
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleLabClick = (selectedLab) => {
    setLab(selectedLab)
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className={`transition-opacity duration-300 ${isPageLoading ? "opacity-0" : "opacity-100"}`}>
        <Card>
          <CardHeader>
            <CardTitle>Semester Lab Explorer</CardTitle>
            <CardDescription>Select a semester and lab to explore the GitHub repository</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.keys(semestersData).map((sem) => (
                <Button
                  key={sem}
                  variant={semester === sem ? "default" : "outline"}
                  onClick={() => handleSemesterClick(sem)}
                >
                  {sem}
                </Button>
              ))}
            </div>

            {semester && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {semestersData[semester].map((labName) => (
                  <Button
                    key={labName}
                    variant={lab === labName ? "default" : "outline"}
                    onClick={() => handleLabClick(labName)}
                  >
                    {labName}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className={`mt-6 transition-opacity duration-300 ${isLoading ? "opacity-100" : "hidden"}`}>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="w-full h-[300px]" />
            </CardContent>
          </Card>
        </div>

        <div
          className={`mt-6 transition-opacity duration-300 ${
            !isLoading && lab !== null ? "opacity-100" : "opacity-0"
          }`}
        >
         
           
              {!isLoading && lab !== null && repoNames[semester]?.[lab] && (
                <GitHubExplorer repo={repoNames[semester][lab]} heading={lab} />
              )}
        </div>
      </div>

      {isPageLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="w-16 h-16 border-4 border-primary border-solid rounded-full animate-spin border-t-transparent"></div>
        </div>
      )}
    </div>
  )
}
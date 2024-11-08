'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Folder, File, ChevronLeft, Download, Loader2, Check, Eye, Code, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from 'react-markdown'

export default function GitHubExplorer({ repo, heading }) {
  const [contents, setContents] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [name, setName] = useState('');
  const [className, setClassName] = useState('S7 CSE B');
  const [rollNumber, setRollNumber] = useState('');
  const [experiment, setExperiment] = useState('');
  const [viewingFile, setViewingFile] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState(null)

  const [explanation, setExplanation] = useState('')

  const answerRef = useRef(null);

  useEffect(() => {
    fetchRepoContents(currentPath);
  }, [currentPath]);

  useEffect(() => {
    if (followUpAnswer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [followUpAnswer]);

  const fetchRepoContents = async (path) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.github.com/repos/Xrg360/${repo}/contents/${path}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contents');
      }
      const data = await response.json();
      setContents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (filePath) => {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/Xrg360/${repo}/master/${filePath}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      return await response.text();
    } catch (err) {
      console.error(err.message);
      return '';
    }
  };

  const generatePDF = useCallback(async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;
      const asterisksLine = '*'.repeat(Math.floor(contentWidth / 1.8));

      doc.setFontSize(9.6);
      doc.text(asterisksLine, margin, margin);
      doc.text(`Name: ${name}`, margin, margin + 8);
      doc.text(`Class: ${className}`, margin, margin + 16);
      doc.text(`Roll Number: ${rollNumber}`, margin, margin + 24);
      doc.text(`Experiment: ${experiment.toUpperCase()}`, margin, margin + 32);
      doc.text(asterisksLine, margin, margin + 40);

      let yOffset = margin + 48;

      for (const file of selectedFiles) {
        const fileContent = await fetchFileContent(file.path);
        if (fileContent) {
          doc.setFontSize(11.2);
          
          doc.text(`${file.name}:`, margin, yOffset);
          yOffset += 8;

          doc.setFont('Courier', 'normal');
          doc.setFontSize(8);

          const lines = doc.splitTextToSize(fileContent, contentWidth);

          for (let i = 0; i < lines.length; i++) {
            if (yOffset > pageHeight - margin - 20) {
              doc.addPage();
              yOffset = margin;
            }
            doc.text(lines[i], margin, yOffset);
            yOffset += 4.8;
          }
          yOffset += 10;
        }
      }

      const img = new Image();
      img.src = '/continuouseval.png';

      img.onload = () => {
        const imgAspectRatio = img.width / img.height;
        const maxImgWidth = contentWidth * 0.8;
        const maxImgHeight = contentHeight * 0.3;
        let imgWidth, imgHeight;

        if (maxImgWidth / imgAspectRatio <= maxImgHeight) {
          imgWidth = maxImgWidth;
          imgHeight = maxImgWidth / imgAspectRatio;
        } else {
          imgHeight = maxImgHeight;
          imgWidth = maxImgHeight * imgAspectRatio;
        }

        const xOffset = margin;
        const remainingSpace = pageHeight - yOffset - margin;

        if (remainingSpace < imgHeight) {
          doc.addPage();
          yOffset = margin;
        }

        doc.addImage(img, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        doc.save(`${experiment}_report.pdf`);

        setSelectedFiles([]);
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFiles, name, className, rollNumber, experiment]);

  const handleFileClick = (item) => {
    if (item.type === 'file') {
      setSelectedFiles((prev) => {
        if (prev.find((file) => file.path === item.path)) {
          return prev.filter((file) => file.path !== item.path);
        }
        return [...prev, item];
      });
    } else if (item.type === 'dir') {
      setCurrentPath(item.path);
      setExperiment(item.name);
    }
  };


  const handleSheetOpenChange = (open) => {
    setIsSheetOpen(open)
    if (!open) {
      setSheetContent(null)
      setExplanation('')
      setFollowUpQuestion('');
      setFollowUpAnswer('');
    }
  }


  const handleBack = () => {
    const newPath = currentPath.split('/').slice(0, -1).join('/');
    setCurrentPath(newPath);
  };

//   const handleViewCode = async (item) => {
//     const content = await fetchFileContent(item.path);
//     setViewingFile({ name: item.name, content });
//     setIsSheetOpen(true)
//   };

const handleViewCode = async (item) => {
    // Simulating file content fetch
    setViewingFile({ ...item, content: await fetchFileContent(item.path) + item.name })
    setSheetContent('viewCode')
    setIsSheetOpen(true)
  }


const explainAlgorithm = async (filePath) => {
  setIsExplaining(true);
  setSheetContent('explainAlgorithm');
  setIsSheetOpen(true);

  try {
    // Fetch the content of the file
    const fileContent = await fetchFileContent(filePath);

    // Construct the prompt for the explanation
    const prompt = `
Please provide a detailed explanation of the following code. Break down the explanation into clear, step-by-step instructions, focusing on the flow of the program and the behavior of the code in different scenarios. Be sure to include the following aspects:
- Overview of the code
- Step-by-step execution algorithm starting with "Step 01: Start of the program" and ending with "Step XX: End of the program"
- Do not provide an overly complex input description; focus on describing the algorithm in detail.

Here is the code:
${fileContent}
`;

    // Make a POST request to your API endpoint
    const response = await fetch('/api/explain-algorithm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const result = await response.json();

    // Handle response errors
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch algorithm explanation');
    }

    // Update state with the explanation
    setExplanation(result.explanation);
  } catch (error) {
    console.error('Error explaining algorithm:', error);
    setExplanation(`Failed to generate algorithm explanation: ${error.message}`);
  } finally {
    setIsExplaining(false);
  }
};

  const handleFollowUpQuestion = async () => {
    setIsAnswering(true);
    try {
      const prompt = `
Based on the following algorithm explanation, please answer this follow-up question:

Algorithm Explanation:
${explanation}

Follow-up Question:
${followUpQuestion}
`;

      const response = await fetch('/api/explain-algorithm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch answer');
      }

      setFollowUpAnswer(result.explanation);
    } catch (error) {
      console.error('Error answering follow-up question:', error);
      setFollowUpAnswer(`Failed to generate answer: ${error.message}`);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleDialogOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      // Clear the follow-up question data when the dialog is closed
      setFollowUpQuestion('');
      setFollowUpAnswer('');
    }
  };

  const renderExplanation = () => {
    if (!explanation) return null;

    return (
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert pb-10">
        <ReactMarkdown>{explanation}</ReactMarkdown>

        <div className="mt-6 p-1">
          <h3 className="text-lg font-semibold mb-2">Follow-up Question</h3>
          <Textarea
            placeholder="Ask a follow-up question about the algorithm..."
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            className="w-full mb-2"
          />
          <Button onClick={handleFollowUpQuestion} disabled={isAnswering}>
            {isAnswering ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin mb-4" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Ask Question
          </Button>
        </div>

        {followUpAnswer && (
          <div className="mt-4" ref={answerRef}>
            <h3 className="text-lg font-semibold mb-2">Answer</h3>
            <ReactMarkdown>{followUpAnswer}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{heading}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-xs"
            />
            <Input
              type="text"
              placeholder="Class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full max-w-xs"
            />
            <Input
              type="text"
              placeholder="Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full max-w-xs"
            />
            <Input
              type="text"
              placeholder={currentPath ? `Experiment: ${currentPath.split('/').pop()}` : "Experiment Name"}
              value={experiment}
              onChange={(e) => setExperiment(e.target.value)}
              className="w-full max-w-xs"
            />
          </div>
          <div className="mb-4 flex flex-wrap items-center space-x-2">
            {currentPath && (
              <Button onClick={handleBack} variant="outline" size="sm" className="mb-2">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <span className="text-sm text-muted-foreground mb-2">
              Current Path: {currentPath || 'Root'}
            </span>
          </div>

          <span className='font-mono text-xs block mb-2'>Click on a file to add into PDF.</span>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {contents.map((item) => (
                <div
                  key={item.path}
                  className={`flex flex-wrap items-center justify-between space-x-2 rounded-md p-2 hover:bg-accent ${
                    selectedFiles.find((file) => file.path === item.path)
                      ? 'bg-accent'
                      : ''
                  }`}
                >
                  <div
                    onClick={() => handleFileClick(item)}
                    className="flex items-center space-x-2 cursor-pointer flex-grow mb-2 sm:mb-0"
                  >
                    {item.type === 'dir' ? (
                      <Folder className="h-4 w-4 text-blue-500" />
                    ) : (
                      <File className="h-4 w-4 text-gray-500" />
                    )}
                    <span>{item.name}</span>
                    {selectedFiles.find((file) => file.path === item.path) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {item.type === 'file' && (
                    <div className="flex flex-wrap space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewCode(item)
                        }}
                        className="mb-2 sm:mb-0"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Code
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          explainAlgorithm(item.path)
                        }}
                        className="mb-2 sm:mb-0"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Explain Algorithm
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
      
            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
              <SheetContent side="bottom" className="h-[80vh] sm:h-[90vh]">
                <SheetHeader>
                  <SheetTitle>
                    {sheetContent === 'viewCode' ? viewingFile?.name : 'Algorithm Explanation'}
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full mt-4">
                  {sheetContent === 'viewCode' && (
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                      <code>{viewingFile?.content}</code>
                    </pre>
                  )}
                  {sheetContent === 'explainAlgorithm' && (
                    <>
                      {isExplaining ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : (
                        renderExplanation()
                      )}
                    </>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </>
          )}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <Button onClick={generatePDF} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download Selected as PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
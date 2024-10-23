"use client"
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Folder, File, ChevronLeft, Download, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function GitHubExplorer() {
  const [contents, setContents] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [name, setName] = useState('');
  const [className, setClassName] = useState('S7 CSE B'); // New state for class
  const [rollNumber, setRollNumber] = useState(''); // New state for roll number
  const [experiment, setExperiment] = useState('');

  useEffect(() => {
    fetchRepoContents(currentPath);
  }, [currentPath]);

  const fetchRepoContents = async (path) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.github.com/repos/Xrg360/KTUS7_Compiler_design_lab/contents/${path}`);
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
      const response = await fetch(`https://raw.githubusercontent.com/Xrg360/KTUS7_Compiler_design_lab/master/${filePath}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      const content = await response.text();
      return content;
    } catch (err) {
      console.error(err.message);
      return '';
    }
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth() * 0.8;
      const pageHeight = doc.internal.pageSize.getHeight() * 0.8;
      const asterisksLine = '*'.repeat(pageWidth / 1.8);

      doc.setFontSize(9.6);
      doc.text(asterisksLine, 8, 8);
      doc.text(`Name: ${name}`, 8, 16);
      doc.text(`Class: ${className}`, 8, 24); // Updated to include class
      doc.text(`Roll Number: ${rollNumber}`, 8, 32); // Added roll number
      doc.text(`Experiment: ${experiment.toUpperCase()}`, 8, 40);
      doc.text(asterisksLine, 8, 48);

      let yOffset = 56;

      for (const file of selectedFiles) {
        const fileContent = await fetchFileContent(file.path);
        if (fileContent) {
          doc.setFontSize(11.2);
          doc.text(`${file.name}:`, 8, yOffset);
          yOffset += 8;

          doc.setFont('Courier', 'normal');
          doc.setFontSize(8);

          const lines = doc.splitTextToSize(fileContent, pageWidth);

          for (let i = 0; i < lines.length; i++) {
            if (yOffset > pageHeight - 20) {
              doc.addPage();
              yOffset = 16;
            }
            doc.text(lines[i], 8, yOffset);
            yOffset += 4.8;
          }
          yOffset += 10;
        }
      }

      const img = new Image();
      img.src = '/continuouseval.png';

      img.onload = () => {
        const imgWidth = img.width * 0.8;
        const imgHeight = img.height * 0.8;
        const maxWidth = pageWidth - 16;
        const maxHeight = pageHeight - yOffset - 16;
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        const imgDisplayWidth = imgWidth * ratio;
        const imgDisplayHeight = imgHeight * ratio;
        const xOffset = (pageWidth - imgDisplayWidth) / 2;

        doc.addImage(img, 'PNG', xOffset, yOffset, imgDisplayWidth, imgDisplayHeight);
        doc.save(`${experiment}_report.pdf`);
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleBack = () => {
    const newPath = currentPath.split('/').slice(0, -1).join('/');
    setCurrentPath(newPath);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Compiler Lab</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="text"
              placeholder="Class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="text"
              placeholder="Roll Number"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="max-w-xs"
            />
            <Input
              type="text"
              placeholder="Experiment Name"
              value={experiment}
              onChange={(e) => setExperiment(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="mb-4 flex items-center space-x-2">
            {currentPath && (
              <Button onClick={handleBack} variant="outline" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              Current Path: {currentPath || 'Root'}
            </span>
          </div>
          <span className='font-mono text-xs'>select the filename you want to add and then click generatePDF</span>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {contents.map((item) => (
                <div
                  key={item.path}
                  onClick={() => handleFileClick(item)}
                  className={`flex cursor-pointer items-center space-x-2 rounded-md p-2 hover:bg-accent ${
                    selectedFiles.find((file) => file.path === item.path)
                      ? 'bg-accent'
                      : ''
                  }`}
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
              ))}
            </ScrollArea>
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

"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { Folder, File, ChevronLeft, Download, Loader2, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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

  useEffect(() => {
    fetchRepoContents(currentPath);
  }, [currentPath]);

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
      const content = await response.text();
      return content;
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
        const maxImgWidth = contentWidth*0.8;
        const maxImgHeight = contentHeight * 0.3; // Limit image height to 30% of content height
        let imgWidth, imgHeight;

        if (maxImgWidth / imgAspectRatio <= maxImgHeight) {
          imgWidth = maxImgWidth;
          imgHeight = maxImgWidth / imgAspectRatio;
        } else {
          imgHeight = maxImgHeight;
          imgWidth = maxImgHeight * imgAspectRatio;
        }

        const xOffset = margin ;
        const remainingSpace = pageHeight - yOffset - margin;

        if (remainingSpace < imgHeight) {
          doc.addPage();
          yOffset = margin;
        }

        doc.addImage(img, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        doc.save(`${experiment}_report.pdf`);

        // Clear cache after downloading
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
      setExperiment(item.name); // Set the experiment name to the selected folder name
    }
  };

  const handleBack = () => {
    const newPath = currentPath.split('/').slice(0, -1).join('/');
    setCurrentPath(newPath);
  };

  const handleViewCode = async (item) => {
    const content = await fetchFileContent(item.path);
    setViewingFile({ name: item.name, content });
  };

  return (
    <div className="container mx-auto">
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
              placeholder={currentPath ? `Experiment: ${currentPath.split('/').pop()}` : "Experiment Name"}
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

          <span className='font-mono text-xs'>Click on a file to add into PDF.</span>
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
                  className={`flex items-center justify-between space-x-2 rounded-md p-2 hover:bg-accent ${
                    selectedFiles.find((file) => file.path === item.path)
                      ? 'bg-accent'
                      : ''
                  }`}
                >
                  <div
                    onClick={() => handleFileClick(item)}
                    className="flex items-center space-x-2 cursor-pointer flex-grow"
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCode(item);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{viewingFile?.name}</DialogTitle>
                        </DialogHeader>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                          <code>{viewingFile?.content}</code>
                        </pre>
                      </DialogContent>
                    </Dialog>
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
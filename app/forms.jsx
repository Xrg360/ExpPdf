"use client"
import React, { useState } from 'react';
import jsPDF from 'jspdf';
function ExperimentForm() {
  const [name, setName] = useState('');
  const [experiment, setExperiment] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch a specific file from GitHub
  const fetchGitHubFile = async (path) => {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/Xrg360/KTUS7_Compiler_design_lab/master/print/${path}`);
      if (!response.ok) throw new Error('File not found');
      return response.text();
    } catch (error) {
      console.warn(`File ${path} not found, skipping...`);
      return null;
    }
  };

 // Generate the PDF
const generatePDF = async () => {
  setLoading(true);
  try {
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth(); // Get page width
    const asterisksLine = '*'.repeat(pageWidth/1.8); // Adjust this factor to fill the width

    // Add custom header
    doc.setFontSize(12);
    doc.text(asterisksLine, 10, 10); // Full width asterisks line
    doc.text(`Name: ${name}`, 10, 20);
    doc.text('Class: S7 CSE B', 10, 30);
    doc.text(`Experiment: ${experiment.toUpperCase()}`, 10, 40);
    doc.text(asterisksLine, 10, 50); // Full width asterisks line

    let yOffset = 60;  // Start content after the header

    // Files to attempt fetching
    const possibleFiles = ['code.c', 'code.l', 'code.y', ,'input.txt','output.txt'];

    for (const file of possibleFiles) {
      const content = await fetchGitHubFile(`${experiment}/${file}`);
      if (content) {
        // Add a heading before each file's content
        doc.setFontSize(14);
        doc.text(`${file}:`, 10, yOffset);
        yOffset += 10;

        // Switch to monospaced font (Courier)
        doc.setFont('Courier', 'normal');
        doc.setFontSize(10);  // Slightly smaller for code formatting

        // Add the file content below its heading
        const lines = doc.splitTextToSize(content, 180); // Wrap text within 180 width
        
        // Adjusted line spacing
        for (let i = 0; i < lines.length; i++) {
          if (yOffset > 280) { // If we're getting too close to the bottom of the page
            doc.addPage();
            yOffset = 20; // Reset yOffset for new page
          }
          doc.text(lines[i], 10, yOffset);
          yOffset += 6; // Reduced line spacing for code
        }

        // Switch back to default font for headings (optional)
        doc.setFont('Helvetica', 'normal');
      }
    }

    // Add the image at the end of the PDF
    const img = new Image();
    img.src = '/continuouseval.png'; // You can use a Base64 string or a URL here

    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Calculate the max dimensions that fit within the page without stretching
      const maxWidth = pageWidth - 20; // 20 for padding
      const maxHeight = pageHeight - yOffset - 20; // Adjust for the current yOffset and some padding

      // Calculate aspect ratio
      const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
      const imgDisplayWidth = imgWidth * ratio;
      const imgDisplayHeight = imgHeight * ratio;

      // Add image to the PDF at the calculated position (centered)
      const xOffset = (pageWidth - imgDisplayWidth) / 2; // Center the image horizontally
      doc.addImage(img, 'PNG', xOffset, yOffset, imgDisplayWidth, imgDisplayHeight);

      // Download the generated PDF
      doc.save(`${experiment}_report.pdf`);
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    setLoading(false);
  }
};


  const handleSubmit = (e) => {
    e.preventDefault();
    generatePDF();
  };

  return (
    <div className='w-full h-screen flex justify-center items-center'>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg bg-white shadow-md">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        required
        className="w-full p-2 mb-4 border border-gray-300 rounded text-black"
      />
      <select value={experiment} onChange={(e) => setExperiment(e.target.value)} required className="w-full text-black p-2 mb-4 border border-gray-300 rounded">
        <option value="">Select Experiment</option>
        <option value="exp1">Experiment 1</option>
        <option value="exp2a">Experiment 2a</option>
        <option value="exp2b">Experiment 2b</option>
        <option value="exp2c">Experiment 2c</option>
        <option value="exp3a">Experiment 3a</option>
        <option value="exp3b">Experiment 3b</option>
        <option value="exp3c">Experiment 3c</option>
        <option value="exp4">Experiment 4</option>
        <option value="exp5">Experiment 5</option>
        <option value="exp6">Experiment 6</option>
        <option value="exp7">Experiment 7</option>
      </select>
      <button type="submit" disabled={loading} className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
        {loading ? 'Generating PDF...' : 'Generate PDF'}
      </button>
    </form>
    </div>
  );
}

export default ExperimentForm;

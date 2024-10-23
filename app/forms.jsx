"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";

function ExperimentForm() {
  const [name, setName] = useState("");
  const [experiment, setExperiment] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch a specific file from GitHub
  const fetchGitHubFile = async (path) => {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/Xrg360/KTUS7_Compiler_design_lab/master/print/${path}`
      );
      if (!response.ok) throw new Error("File not found");
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

      const pageWidth = doc.internal.pageSize.getWidth() * 0.8; // Scale to 80%
      const pageHeight = doc.internal.pageSize.getHeight() * 0.8;
      const asterisksLine = "*".repeat(pageWidth / 1.8);

      // Add custom header
      doc.setFontSize(9.6); // Scaled font size (80% of original 12)
      doc.text(asterisksLine, 8, 8); // Adjust position for 80% scaling
      doc.text(`Name: ${name}`, 8, 16);
      doc.text("Class: S7 CSE B", 8, 24);
      doc.text(`Experiment: ${experiment.toUpperCase()}`, 8, 32);
      doc.text(asterisksLine, 8, 40);

      let yOffset = 48; // Start content after the header

      // Files to attempt fetching
      const possibleFiles = ["code.c", "code.l", "code.y", "input.txt", "output.txt"];

      for (const file of possibleFiles) {
        const content = await fetchGitHubFile(`${experiment}/${file}`);
        if (content) {
          // Add a heading before each file's content
          doc.setFontSize(11.2); // Scaled font size (80% of original 14)
          doc.text(`${file}:`, 8, yOffset);
          yOffset += 8;

          // Switch to monospaced font (Courier)
          doc.setFont("Courier", "normal");
          doc.setFontSize(8); // Scaled font size (80% of original 10)

          // Add the file content below its heading
          const lines = doc.splitTextToSize(content, pageWidth);

          for (let i = 0; i < lines.length; i++) {
            if (yOffset > pageHeight - 20) {
              doc.addPage();
              yOffset = 16;
            }
            doc.text(lines[i], 8, yOffset);
            yOffset += 4.8; // Reduced line spacing for scaled font size
          }

          // Switch back to default font for headings (optional)
          doc.setFont("Helvetica", "normal");
        }
      }

      // Add the image at the end of the PDF
      const img = new Image();
      img.src = "/continuouseval.png"; // You can use a Base64 string or a URL here

      img.onload = () => {
        const imgWidth = img.width * 0.8; // Scale image to 80%
        const imgHeight = img.height * 0.8;
        const maxWidth = pageWidth - 16;
        const maxHeight = pageHeight - yOffset - 16;
        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        const imgDisplayWidth = imgWidth * ratio;
        const imgDisplayHeight = imgHeight * ratio;
        const xOffset = (pageWidth - imgDisplayWidth) / 2;

        doc.addImage(img, "PNG", xOffset, yOffset, imgDisplayWidth, imgDisplayHeight);
        doc.save(`${experiment}_report.pdf`);
      };
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generatePDF();
  };

  return (
    <div className="w-full h-screen flex justify-center items-center ">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg bg-white shadow-md"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded "
        />
        <select
          value={experiment}
          onChange={(e) => setExperiment(e.target.value)}
          required
          className="w-full  p-2 mb-4 border border-gray-300 rounded"
        >
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
          <option value="exp8">Experiment 8</option>
          <option value="exp9">Experiment 9</option>
          <option value="exp10">Experiment 10</option>
          <option value="exp11">Experiment 11</option>
          
          
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Generating PDF..." : "Generate PDF"}
        </button>
      </form>
    </div>
  );
}

export default ExperimentForm;

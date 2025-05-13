import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// A super simple version of the product enhancement page
export default function ProductEnhancementWebhookSimple() {
  const { toast } = useToast();
  const [industry, setIndustry] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [enhancementId, setEnhancementId] = useState<string | null>(null);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!industry) {
      toast({
        title: "Industry Required",
        description: "Please enter your industry.",
        variant: "destructive"
      });
      return;
    }
    
    if (!files || files.length === 0) {
      toast({
        title: "Images Required",
        description: "Please select at least one image.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append("industry", industry);
      
      // Add each file
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }
      
      // Make the request
      const response = await fetch("/api/product-enhancement/start", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      setEnhancementId(data.enhancementId);
      toast({
        title: "Upload Successful",
        description: `Enhancement ID: ${data.enhancementId}`
      });
      
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "sans-serif"
    },
    header: {
      backgroundColor: "#3b82f6",
      color: "white",
      padding: "15px 20px",
      borderRadius: "8px",
      marginBottom: "20px"
    },
    form: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      marginBottom: "20px"
    },
    inputGroup: {
      marginBottom: "15px"
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "500"
    },
    input: {
      width: "100%",
      padding: "8px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "5px",
      fontSize: "16px"
    },
    uploadArea: {
      border: "2px dashed #d1d5db",
      borderRadius: "5px",
      padding: "20px",
      textAlign: "center" as const
    },
    button: {
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "5px",
      padding: "10px 20px",
      fontSize: "16px",
      fontWeight: "500",
      cursor: "pointer"
    },
    disabledButton: {
      backgroundColor: "#93c5fd",
      cursor: "not-allowed"
    },
    result: {
      backgroundColor: "#ecfdf5",
      padding: "15px",
      borderRadius: "5px",
      borderLeft: "4px solid #059669"
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Product Enhancement with Webhook</h1>
        <p>Simplified Version for Testing</p>
      </div>
      
      {!enhancementId ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Fashion, Electronics, Food"
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Images (up to 5)</label>
            <div style={styles.uploadArea}>
              <p>Select up to 5 product images</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>
          </div>
          
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(isUploading ? styles.disabledButton : {})
            }}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Start Enhancement"}
          </button>
        </form>
      ) : (
        <div style={styles.form}>
          <div style={styles.result}>
            <h2>Upload Successful</h2>
            <p>Enhancement ID: {enhancementId}</p>
          </div>
          
          <button
            style={styles.button}
            onClick={() => {
              setEnhancementId(null);
              setFiles(null);
              setIndustry("");
            }}
          >
            Start New Enhancement
          </button>
        </div>
      )}
      
      <div style={{textAlign: "center", marginTop: "20px"}}>
        <a href="/direct-product-enhancement.html">Back to Test Menu</a>
      </div>
    </div>
  );
}
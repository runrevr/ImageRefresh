import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface SimulationToggleProps {
  isSimulationMode: boolean;
  setSimulationMode: (enabled: boolean) => void;
  resetLab: () => void;
}

/**
 * Toggle component for the Product Image Lab simulation mode
 * Allows toggling between real API calls and simulated responses
 */
const ProductImageLabSimulationToggle: React.FC<SimulationToggleProps> = ({
  isSimulationMode,
  setSimulationMode,
  resetLab
}) => {
  const { toast } = useToast();

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    
    // Update simulation mode
    setSimulationMode(enabled);
    
    // Reset lab to clear any existing state
    resetLab();
    
    // Show user feedback
    toast({
      title: enabled ? "Simulation Mode Enabled" : "Simulation Mode Disabled",
      description: enabled 
        ? "API calls will be simulated without contacting external services" 
        : "Real API calls will be made to transformation services"
    });
  };

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <label htmlFor="simulation-mode-toggle" style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
        Simulation Mode:
      </label>
      <input 
        id="simulation-mode-toggle"
        type="checkbox" 
        checked={isSimulationMode} 
        onChange={handleToggle}
      />
      <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
        (N8N webhook calls will be simulated)
      </span>
    </div>
  );
};

export default ProductImageLabSimulationToggle;
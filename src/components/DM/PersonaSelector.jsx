import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaCheck } from 'react-icons/fa';
import zentroBotAI from '../../services/geminiAI';

/**
 * PersonaSelector - Component for selecting ZentroBot personas
 * 
 * Features:
 * - Visual persona cards with descriptions
 * - Smooth animations
 * - Current persona indicator
 * - Easy switching between personas
 */
const PersonaSelector = ({ userId, currentPersona, onPersonaChange, onClose, theme }) => {
  const [selectedPersona, setSelectedPersona] = useState(currentPersona);
  const personas = zentroBotAI.getAllPersonas();

  const handlePersonaSelect = (personaId) => {
    setSelectedPersona(personaId);
  };

  const handleConfirm = () => {
    if (zentroBotAI.setPersona(userId, selectedPersona)) {
      onPersonaChange(selectedPersona);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderMuted
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <FaRobot className="text-white text-lg" />
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: theme.colors.text }}
              >
                Choose Your ZentroBot Persona
              </h2>
              <p
                className="text-sm"
                style={{ color: theme.colors.textMuted }}
              >
                Each persona has a unique personality and specialties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            style={{ color: theme.colors.textMuted }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {personas.map((persona) => (
            <motion.div
              key={persona.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePersonaSelect(persona.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedPersona === persona.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              style={{
                backgroundColor: selectedPersona === persona.id 
                  ? theme.colors.primaryMuted 
                  : theme.colors.surfaceVariant
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="text-3xl">{persona.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className="font-semibold"
                      style={{ color: theme.colors.text }}
                    >
                      {persona.name}
                    </h3>
                    {selectedPersona === persona.id && (
                      <FaCheck className="text-purple-400" />
                    )}
                  </div>
                  <p
                    className="text-sm mb-3"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {persona.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {persona.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: theme.colors.primaryMuted,
                          color: theme.colors.primary
                        }}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Current Selection Info */}
        {selectedPersona && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.borderMuted
            }}
          >
            <h4
              className="font-medium mb-2"
              style={{ color: theme.colors.text }}
            >
              Selected Persona Preview:
            </h4>
            <p
              className="text-sm"
              style={{ color: theme.colors.textMuted }}
            >
              {zentroBotAI.getPersonaInfo(selectedPersona).tone}
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg border transition-colors"
            style={{
              borderColor: theme.colors.borderMuted,
              color: theme.colors.textMuted
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPersona}
            className="flex-1 py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.colors.primary,
              color: 'white'
            }}
          >
            Confirm Selection
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonaSelector;

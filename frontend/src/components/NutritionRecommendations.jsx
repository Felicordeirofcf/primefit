import React, { useState } from 'react';
import { 
  Utensils, 
  Clock, 
  Users, 
  ChefHat, 
  Leaf,
  AlertCircle,
  RefreshCw,
  Heart
} from 'lucide-react';

const NutritionRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState('');
  
  const [nutritionForm, setNutritionForm] = useState({
    calorias_objetivo: '',
    preferencias: '',
    restricoes: ''
  });

  const getMealRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/nutrition/meal-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calorias_objetivo: parseInt(nutritionForm.calorias_objetivo),
          preferencias: nutritionForm.preferencias,
          restricoes: nutritionForm.restricoes
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setRecommendations(data.meal_recommendations);
      } else {
        throw new Error('Erro ao obter recomendações');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao obter recomendações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const calorieOptions = [
    { value: 1200, label: '1200 kcal - Perda de peso acelerada' },
    { value: 1500, label: '1500 kcal - Perda de peso moderada' },
    { value: 1800, label: '1800 kcal - Manutenção (mulheres)' },
    { value: 2000, label: '2000 kcal - Manutenção (homens sedentários)' },
    { value: 2200, label: '2200 kcal - Manutenção (homens ativos)' },
    { value: 2500, label: '2500 kcal - Ganho de massa' }
  ];

  const commonPreferences = [
    'Vegetariano',
    'Vegano',
    'Low Carb',
    'Cetogênica',
    'Mediterrânea',
    'Sem glúten',
    'Sem lactose',
    'Rica em proteínas',
    'Comida brasileira',
    'Pratos rápidos'
  ];

  const commonRestrictions = [
    'Diabetes',
    'Hipertensão',
    'Colesterol alto',
    'Intolerância à lactose',
    'Doença celíaca',
    'Alergia a frutos do mar',
    'Alergia a nozes',
    'Refluxo gastroesofágico'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Utensils className="mr-3" size={32} />
          Recomendações Nutricionais
        </h1>
        <p className="text-green-100">
          Receba sugestões personalizadas de refeições baseadas em seus objetivos e preferências
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <ChefHat className="mr-2" size={24} />
          Configure suas Preferências
        </h2>

        <div className="space-y-6">
          {/* Objetivo Calórico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo Calórico Diário
            </label>
            <select
              value={nutritionForm.calorias_objetivo}
              onChange={(e) => setNutritionForm({...nutritionForm, calorias_objetivo: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecione seu objetivo calórico</option>
              {calorieOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preferências Alimentares */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferências Alimentares
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonPreferences.map(preference => (
                <button
                  key={preference}
                  type="button"
                  onClick={() => {
                    const current = nutritionForm.preferencias;
                    const preferences = current ? current.split(', ') : [];
                    if (preferences.includes(preference)) {
                      const updated = preferences.filter(p => p !== preference);
                      setNutritionForm({...nutritionForm, preferencias: updated.join(', ')});
                    } else {
                      setNutritionForm({...nutritionForm, preferencias: [...preferences, preference].join(', ')});
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    nutritionForm.preferencias.includes(preference)
                      ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {preference}
                </button>
              ))}
            </div>
            <textarea
              value={nutritionForm.preferencias}
              onChange={(e) => setNutritionForm({...nutritionForm, preferencias: e.target.value})}
              placeholder="Descreva suas preferências alimentares (ex: vegetariano, low carb, comida brasileira...)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>

          {/* Restrições */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restrições Alimentares ou de Saúde
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonRestrictions.map(restriction => (
                <button
                  key={restriction}
                  type="button"
                  onClick={() => {
                    const current = nutritionForm.restricoes;
                    const restrictions = current ? current.split(', ') : [];
                    if (restrictions.includes(restriction)) {
                      const updated = restrictions.filter(r => r !== restriction);
                      setNutritionForm({...nutritionForm, restricoes: updated.join(', ')});
                    } else {
                      setNutritionForm({...nutritionForm, restricoes: [...restrictions, restriction].join(', ')});
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    nutritionForm.restricoes.includes(restriction)
                      ? 'bg-red-100 text-red-800 border-2 border-red-300'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {restriction}
                </button>
              ))}
            </div>
            <textarea
              value={nutritionForm.restricoes}
              onChange={(e) => setNutritionForm({...nutritionForm, restricoes: e.target.value})}
              placeholder="Descreva restrições alimentares, alergias ou condições de saúde (opcional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>

          <button
            onClick={getMealRecommendations}
            disabled={isLoading || !nutritionForm.calorias_objetivo || !nutritionForm.preferencias}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 animate-spin" size={18} />
                Gerando Recomendações...
              </>
            ) : (
              <>
                <Heart className="mr-2" size={18} />
                Obter Recomendações Personalizadas
              </>
            )}
          </button>
        </div>

        {/* Resultados */}
        {recommendations && (
          <div className="mt-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <div className="flex items-start">
              <Utensils className="mr-3 text-green-600 flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-green-800 mb-4">
                  Suas Recomendações Personalizadas
                </h3>
                <div className="prose prose-green max-w-none">
                  <div className="whitespace-pre-line text-green-700 leading-relaxed">
                    {recommendations}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dicas Nutricionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="mr-2 text-blue-600" size={20} />
              <h4 className="font-semibold text-blue-800">Dica de Timing</h4>
            </div>
            <p className="text-blue-700 text-sm">
              Consuma proteínas dentro de 30 minutos após o treino para otimizar a recuperação muscular.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Leaf className="mr-2 text-green-600" size={20} />
              <h4 className="font-semibold text-green-800">Hidratação</h4>
            </div>
            <p className="text-green-700 text-sm">
              Beba pelo menos 35ml de água por kg de peso corporal diariamente, aumentando em dias de treino.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="mr-2 text-yellow-600" size={20} />
              <h4 className="font-semibold text-yellow-800">Planejamento</h4>
            </div>
            <p className="text-yellow-700 text-sm">
              Prepare suas refeições com antecedência para manter a consistência na sua dieta.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="mr-2 text-purple-600" size={20} />
              <h4 className="font-semibold text-purple-800">Importante</h4>
            </div>
            <p className="text-purple-700 text-sm">
              Consulte sempre um nutricionista para um plano alimentar personalizado e seguro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionRecommendations;


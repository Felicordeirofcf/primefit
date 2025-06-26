import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { trainingsAPI, assessmentsAPI, progressAPI } from '../../api/apiClient';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar } from '../../components/ui/calendar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Activity, Calendar as CalendarIcon, Dumbbell, LineChart as LineChartIcon,
  User, Users, MessageSquare, Award, TrendingUp
} from 'lucide-react';

// (... restante do código permanece igual ao original enviado ...)

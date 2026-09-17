insert into public.ido_metric_definitions(metric_id,version,label,family,formula,time_basis,status,definition,owner_id) values
('real_estate.lead_to_sale_conversion','0.1.0','Lead → Venta conversion','real_estate_intelligence','canonical_sales / eligible_unique_leads','cohort_or_period_explicit','definition_required_per_source','{"claim_class":"descriptive","allowed_surfaces":["chart","report","rag","model_feature"]}',null),
('real_estate.net_absorption_30d','1.0.0','Absorción neta 30d','real_estate_intelligence','net_separations_30d / stock_at_window_start','rolling_30d','canonical_in_medallio','{"claim_class":"descriptive","allowed_surfaces":["chart","report","rag","pricing_feature"]}',null),
('capital.fx_effective_cost','1.0.0','Costo efectivo USD/PEN','personal_capital','soles_spent / net_usd_available','transaction_scenario','implemented','{"claim_class":"descriptive","allowed_surfaces":["chart","report","rag"]}',null),
('gold.expected_value_net','0.1.0','Expected value net of execution costs','gold_decision','expected_trade_pnl - spread - commission - expected_slippage','signal','research_gate','{"claim_class":"predictive","allowed_surfaces":["research","rag","promotion_gate"]}',null),
('health.home_meal_coverage_days','0.1.0','Home Meal Coverage Days','household_readiness','feasible_meal_capacity / planned_daily_meals','current_snapshot','product_metric','{"claim_class":"descriptive","allowed_surfaces":["chart","report","rag","notification"]}',null)
on conflict (metric_id,version) do update set
  label=excluded.label,
  family=excluded.family,
  formula=excluded.formula,
  time_basis=excluded.time_basis,
  status=excluded.status,
  definition=excluded.definition;